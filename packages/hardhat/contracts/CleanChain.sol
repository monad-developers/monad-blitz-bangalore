//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
// import "hardhat/console.sol"; // REMOVED: console.log not needed in production

/**
 * CleanChain - Decentralized Garbage Collection Verification Platform
 * A smart contract for tracking, verifying, and incentivizing neighborhood garbage collection
 * @author CleanChain Team
 */
contract CleanChain {
    // State Variables
    address public immutable owner;
    uint256 public totalHouses = 0;
    uint256 public totalCleaners = 0;
    uint256 public totalCollectionEvents = 0;
    uint256 public totalComplaints = 0;

    // Data Structures as defined in PRD
    struct House {
        address wallet;
        uint256 points;
        string neighborhood;
        uint8 residents;
        bytes32[] collectionHashes;
        bool isRegistered;
        uint256 registrationTimestamp;
    }

    struct Cleaner {
        address wallet;
        uint256 points;
        uint256 reputation;
        bytes32[] collectionHashes;
        bool isRegistered;
        uint256 registrationTimestamp;
        string[] assignedNeighborhoods; // Neighborhoods where cleaner is authorized
    }

    struct CollectionEvent {
        address cleaner;
        address house;
        uint256 timestamp;
        bytes32 imageHash;
        string imageURI;
        bool confirmedByHouse;
        uint256 eventId;
    }

    struct Complaint {
        address reporter;
        bytes32 imageHash;
        string imageURI;
        string location;
        string neighborhood;
        address[] validators;
        uint8 status; // 0 = PENDING, 1 = VALIDATED, 2 = INVALID
        uint256 timestamp;
        uint256 complaintId;
    }

    struct Neighborhood {
        string name;
        string description;
        address admin;
        bool isActive;
        uint256 registrationTimestamp;
        uint256 totalHouses;
        uint256 totalCleaners;
        uint256 totalCollections;
        uint256 confirmedCollections;
    }

    // Mappings
    mapping(address => House) public houses;
    mapping(address => Cleaner) public cleaners;
    mapping(uint256 => CollectionEvent) public collectionEvents;
    mapping(uint256 => Complaint) public complaints;
    mapping(string => address[]) public neighborhoodHouses; // neighborhood => array of house addresses
    mapping(string => address[]) public neighborhoodCleaners; // neighborhood => array of cleaner addresses
    mapping(string => Neighborhood) public neighborhoods; // neighborhood name => Neighborhood struct
    mapping(address => bool) public neighborhoodAdmins; // address => is neighborhood admin
    mapping(string => mapping(address => bool)) public cleanerNeighborhoodAccess; // neighborhood => cleaner => authorized

    // Arrays for enumeration
    address[] public registeredHouses;
    address[] public registeredCleaners;
    string[] public registeredNeighborhoods;

    // Contract state
    bool public contractPaused = false;

    // Events
    event HouseRegistered(address indexed wallet, string neighborhood, uint8 residents, uint256 timestamp);
    event CleanerRegistered(address indexed wallet, uint256 timestamp);
    event CollectionEventCreated(
        uint256 indexed eventId,
        address indexed cleaner,
        address indexed house,
        bytes32 imageHash,
        uint256 timestamp
    );
    event CollectionEventConfirmed(uint256 indexed eventId, address indexed house);
    event ComplaintCreated(
        uint256 indexed complaintId,
        address indexed reporter,
        string location,
        string neighborhood,
        bytes32 imageHash
    );
    event PointsAwarded(address indexed recipient, uint256 points, string reason);
    event NeighborhoodRegistered(string indexed neighborhoodName, address indexed admin, uint256 timestamp);
    event NeighborhoodAdminAssigned(string indexed neighborhoodName, address indexed admin);
    event CleanerAssignedToNeighborhood(address indexed cleaner, string neighborhoodName);
    event CleanerRemovedFromNeighborhood(address indexed cleaner, string neighborhoodName);
    event ContractPaused(bool paused);
    event NeighborhoodStatusChanged(string indexed neighborhoodName, bool isActive);

    // Constructor
    constructor(address _owner) {
        owner = _owner;
        // console.log("CleanChain contract deployed by:", _owner); // REMOVED
    }

    // Modifiers
    modifier isOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier onlyRegisteredHouse() {
        require(houses[msg.sender].isRegistered, "House not registered");
        _;
    }

    modifier onlyRegisteredCleaner() {
        require(cleaners[msg.sender].isRegistered, "Cleaner not registered");
        _;
    }

    modifier validNeighborhood(string memory _neighborhood) {
        require(bytes(_neighborhood).length > 0, "Neighborhood cannot be empty");
        require(neighborhoods[_neighborhood].isActive, "Neighborhood not active or doesn't exist");
        _;
    }

    modifier validResidents(uint8 _residents) {
        require(_residents > 0 && _residents <= 20, "Invalid number of residents");
        _;
    }

    modifier whenNotPaused() {
        require(!contractPaused, "Contract is paused");
        _;
    }

    modifier onlyNeighborhoodAdmin(string memory _neighborhood) {
        require(
            msg.sender == owner || 
            (neighborhoods[_neighborhood].admin == msg.sender && neighborhoodAdmins[msg.sender]),
            "Not authorized neighborhood admin"
        );
        _;
    }

    modifier cleanerAuthorizedInNeighborhood(address _cleaner, string memory _neighborhood) {
        require(
            cleanerNeighborhoodAccess[_neighborhood][_cleaner] || 
            neighborhoods[_neighborhood].admin == _cleaner,
            "Cleaner not authorized in this neighborhood"
        );
        _;
    }

    // Neighborhood Management Functions
    /**
     * Register a new neighborhood with admin
     * @param _name Name of the neighborhood
     * @param _description Description of the neighborhood
     * @param _admin Address of the neighborhood admin
     */
    function registerNeighborhood(
        string memory _name,
        string memory _description,
        address _admin
    ) 
        external 
        whenNotPaused
    {
        require(bytes(_name).length > 0, "Neighborhood name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_admin != address(0), "Invalid admin address");
        require(bytes(neighborhoods[_name].name).length == 0, "Neighborhood already exists"); // FIXED: Proper check for existing neighborhood
        
        // Create new neighborhood
        Neighborhood storage newNeighborhood = neighborhoods[_name];
        newNeighborhood.name = _name;
        newNeighborhood.description = _description;
        newNeighborhood.admin = _admin;
        newNeighborhood.isActive = true;
        newNeighborhood.registrationTimestamp = block.timestamp;
        
        // Set admin permissions
        neighborhoodAdmins[_admin] = true;
        
        // Add to enumeration array
        registeredNeighborhoods.push(_name);
        
        // console.log("Neighborhood registered:", _name, "with admin:", _admin); // REMOVED
        emit NeighborhoodRegistered(_name, _admin, block.timestamp);
    }

    /**
     * Assign or change neighborhood admin
     * @param _neighborhood Name of the neighborhood
     * @param _newAdmin Address of the new admin
     */
    function assignNeighborhoodAdmin(
        string memory _neighborhood,
        address _newAdmin
    ) 
        external 
        whenNotPaused
    {
        require(neighborhoods[_neighborhood].isActive, "Neighborhood doesn't exist");
        require(_newAdmin != address(0), "Invalid admin address");
        
        address oldAdmin = neighborhoods[_neighborhood].admin;
        
        // FIXED: Only remove admin permissions if they're not admin of other neighborhoods
        if (oldAdmin != _newAdmin && oldAdmin != owner) {
            bool isAdminOfOtherNeighborhoods = false;
            for (uint256 i = 0; i < registeredNeighborhoods.length; i++) {
                string memory neighName = registeredNeighborhoods[i];
                if (keccak256(abi.encodePacked(neighName)) != keccak256(abi.encodePacked(_neighborhood)) &&
                    neighborhoods[neighName].admin == oldAdmin) {
                    isAdminOfOtherNeighborhoods = true;
                    break;
                }
            }
            if (!isAdminOfOtherNeighborhoods) {
                neighborhoodAdmins[oldAdmin] = false;
            }
        }
        
        // Set new admin
        neighborhoods[_neighborhood].admin = _newAdmin;
        neighborhoodAdmins[_newAdmin] = true;
        
        emit NeighborhoodAdminAssigned(_neighborhood, _newAdmin);
    }

    /**
     * Activate or deactivate a neighborhood
     * @param _neighborhood Name of the neighborhood
     * @param _isActive New status for the neighborhood
     */
    function setNeighborhoodStatus(
        string memory _neighborhood,
        bool _isActive
    ) 
        external 
        onlyNeighborhoodAdmin(_neighborhood)
        whenNotPaused
    {
        require(bytes(neighborhoods[_neighborhood].name).length > 0, "Neighborhood doesn't exist");
        neighborhoods[_neighborhood].isActive = _isActive;
        
        emit NeighborhoodStatusChanged(_neighborhood, _isActive);
    }

    /**
     * Assign cleaner to neighborhood (by admin or owner)
     * @param _cleaner Address of the cleaner
     * @param _neighborhood Name of the neighborhood
     */
    function assignCleanerToNeighborhood(
        address _cleaner,
        string memory _neighborhood
    ) 
        external 
        onlyNeighborhoodAdmin(_neighborhood)
        whenNotPaused
    {
        require(cleaners[_cleaner].isRegistered, "Cleaner not registered");
        require(neighborhoods[_neighborhood].isActive, "Neighborhood not active");
        require(!cleanerNeighborhoodAccess[_neighborhood][_cleaner], "Cleaner already assigned");
        
        cleanerNeighborhoodAccess[_neighborhood][_cleaner] = true;
        cleaners[_cleaner].assignedNeighborhoods.push(_neighborhood);
        neighborhoodCleaners[_neighborhood].push(_cleaner);
        neighborhoods[_neighborhood].totalCleaners++;
        
        emit CleanerAssignedToNeighborhood(_cleaner, _neighborhood);
    }

    /**
     * Remove cleaner from neighborhood
     * @param _cleaner Address of the cleaner
     * @param _neighborhood Name of the neighborhood
     */
    function removeCleanerFromNeighborhood(
        address _cleaner,
        string memory _neighborhood
    ) 
        external 
        onlyNeighborhoodAdmin(_neighborhood)
        whenNotPaused
    {
        require(cleanerNeighborhoodAccess[_neighborhood][_cleaner], "Cleaner not assigned to neighborhood");
        
        cleanerNeighborhoodAccess[_neighborhood][_cleaner] = false;
        
        // Remove from cleaner's assigned neighborhoods array
        string[] storage assigned = cleaners[_cleaner].assignedNeighborhoods;
        for (uint256 i = 0; i < assigned.length; i++) {
            if (keccak256(abi.encodePacked(assigned[i])) == keccak256(abi.encodePacked(_neighborhood))) {
                assigned[i] = assigned[assigned.length - 1];
                assigned.pop();
                break;
            }
        }
        
        // FIXED: Remove from neighborhood cleaners array
        address[] storage neighborhoodCleanersList = neighborhoodCleaners[_neighborhood];
        for (uint256 i = 0; i < neighborhoodCleanersList.length; i++) {
            if (neighborhoodCleanersList[i] == _cleaner) {
                neighborhoodCleanersList[i] = neighborhoodCleanersList[neighborhoodCleanersList.length - 1];
                neighborhoodCleanersList.pop();
                break;
            }
        }
        
        neighborhoods[_neighborhood].totalCleaners--;
        
        emit CleanerRemovedFromNeighborhood(_cleaner, _neighborhood);
    }

    // House Registration Functions
    /**
     * Register a house with wallet public key and metadata
     * @param _neighborhood The neighborhood where the house is located
     * @param _residents Number of residents in the house
     */
    function registerHouse(
        string memory _neighborhood,
        uint8 _residents
    ) 
        external 
        validNeighborhood(_neighborhood)
        validResidents(_residents)
        whenNotPaused
    {
        require(!houses[msg.sender].isRegistered, "House already registered");
        
        // Create new house
        House storage newHouse = houses[msg.sender];
        newHouse.wallet = msg.sender;
        newHouse.points = 0;
        newHouse.neighborhood = _neighborhood;
        newHouse.residents = _residents;
        newHouse.isRegistered = true;
        newHouse.registrationTimestamp = block.timestamp;

        // Add to arrays for enumeration
        registeredHouses.push(msg.sender);
        neighborhoodHouses[_neighborhood].push(msg.sender);
        
        // Update neighborhood statistics
        neighborhoods[_neighborhood].totalHouses++;
        
        // Increment counter
        totalHouses++;

        // Award registration points
        awardPoints(msg.sender, 10, "House Registration");

        // console.log("House registered:", msg.sender, "in neighborhood:", _neighborhood); // REMOVED
        emit HouseRegistered(msg.sender, _neighborhood, _residents, block.timestamp);
    }

    /**
     * Register a cleaner with wallet public key
     */
    function registerCleaner() external whenNotPaused {
        require(!cleaners[msg.sender].isRegistered, "Cleaner already registered");
        require(!houses[msg.sender].isRegistered, "Address already registered as house");
        
        // Create new cleaner
        Cleaner storage newCleaner = cleaners[msg.sender];
        newCleaner.wallet = msg.sender;
        newCleaner.points = 0;
        newCleaner.reputation = 100; // Start with base reputation
        newCleaner.isRegistered = true;
        newCleaner.registrationTimestamp = block.timestamp;

        // Add to array for enumeration
        registeredCleaners.push(msg.sender);
        
        // Increment counter
        totalCleaners++;

        // Award registration points
        awardPoints(msg.sender, 10, "Cleaner Registration");

        // console.log("Cleaner registered:", msg.sender); // REMOVED
        emit CleanerRegistered(msg.sender, block.timestamp);
    }

    // Collection Event Functions
    /**
     * Log garbage collection by cleaner with image proof
     * @param _houseAddress Address of the house where garbage was collected
     * @param _imageHash Hash of the image taken as proof of collection
     * @param _imageURI URI pointing to the off-chain stored image
     */
    function logGarbageCollection(
        address _houseAddress,
        bytes32 _imageHash,
        string memory _imageURI
    ) 
        external 
        onlyRegisteredCleaner
        whenNotPaused
    {
        require(houses[_houseAddress].isRegistered, "House not registered");
        require(_imageHash != bytes32(0), "Image hash cannot be empty");
        require(bytes(_imageURI).length > 0, "Image URI cannot be empty");
        
        string memory houseNeighborhood = houses[_houseAddress].neighborhood;
        
        // Check if cleaner is authorized in this neighborhood
        require(
            cleanerNeighborhoodAccess[houseNeighborhood][msg.sender] ||
            neighborhoods[houseNeighborhood].admin == msg.sender ||
            msg.sender == owner,
            "Cleaner not authorized in this neighborhood"
        );
        
        // Create new collection event
        uint256 eventId = totalCollectionEvents;
        CollectionEvent storage newEvent = collectionEvents[eventId];
        newEvent.cleaner = msg.sender;
        newEvent.house = _houseAddress;
        newEvent.timestamp = block.timestamp;
        newEvent.imageHash = _imageHash;
        newEvent.imageURI = _imageURI;
        newEvent.confirmedByHouse = false;
        newEvent.eventId = eventId;

        // Add hash to cleaner's collection history
        cleaners[msg.sender].collectionHashes.push(_imageHash);
        
        // Update neighborhood statistics
        neighborhoods[houseNeighborhood].totalCollections++;
        
        // Increment counter
        totalCollectionEvents++;

        // Award points to cleaner
        awardPoints(msg.sender, 20, "Garbage Collection");

        // console.log("Garbage collection logged by cleaner:", msg.sender, "at house:", _houseAddress); // REMOVED
        emit CollectionEventCreated(eventId, msg.sender, _houseAddress, _imageHash, block.timestamp);
    }

    /**
     * Confirm garbage collection by house with validation
     * @param _eventId ID of the collection event to confirm
     * @param _imageHash Hash of the validation image taken by the house
     * @param _imageURI URI pointing to the house's validation image
     */
    function confirmGarbageCollection(
        uint256 _eventId,
        bytes32 _imageHash,
        string memory _imageURI
    ) 
        external 
        onlyRegisteredHouse
        whenNotPaused
    {
        require(_eventId < totalCollectionEvents, "Invalid event ID");
        require(_imageHash != bytes32(0), "Image hash cannot be empty");
        require(bytes(_imageURI).length > 0, "Image URI cannot be empty");
        
        CollectionEvent storage collectionEvent = collectionEvents[_eventId];
        require(collectionEvent.house == msg.sender, "Not authorized to confirm this event");
        require(!collectionEvent.confirmedByHouse, "Event already confirmed");
        
        // Confirm the event
        collectionEvent.confirmedByHouse = true;
        
        // FIXED: Only add the house's validation hash, not the cleaner's proof hash
        houses[msg.sender].collectionHashes.push(_imageHash);
        
        // Update neighborhood statistics
        string memory houseNeighborhood = houses[msg.sender].neighborhood;
        neighborhoods[houseNeighborhood].confirmedCollections++;
        
        // Award bonus points to both cleaner and house for confirmed collection
        awardPoints(collectionEvent.cleaner, 10, "Confirmed Collection Bonus");
        awardPoints(msg.sender, 15, "Collection Validation");
        
        // Increase cleaner's reputation for confirmed work
        cleaners[collectionEvent.cleaner].reputation += 5;

        emit CollectionEventConfirmed(_eventId, msg.sender);
    }

    /**
     * Get collection event details by ID
     * @param _eventId ID of the collection event
     * @return CollectionEvent struct containing event details
     */
    function getCollectionEvent(uint256 _eventId) external view returns (CollectionEvent memory) {
        require(_eventId < totalCollectionEvents, "Invalid event ID");
        return collectionEvents[_eventId];
    }

    /**
     * Get collection events for a house with pagination to avoid gas issues
     * @param _houseAddress Address of the house
     * @param _offset Starting index for pagination
     * @param _limit Maximum number of events to return
     * @return Array of event IDs for the house
     * @return Total count of events for this house
     */
    function getHouseCollectionEventsPaginated(
        address _houseAddress, 
        uint256 _offset, 
        uint256 _limit
    ) external view returns (uint256[] memory, uint256) {
        require(houses[_houseAddress].isRegistered, "House not registered");
        require(_limit > 0 && _limit <= 100, "Invalid limit: must be between 1 and 100");
        
        // Count total events first
        uint256 totalCount = 0;
        for (uint256 i = 0; i < totalCollectionEvents; i++) {
            if (collectionEvents[i].house == _houseAddress) {
                totalCount++;
            }
        }
        
        if (_offset >= totalCount) {
            return (new uint256[](0), totalCount);
        }
        
        uint256 resultSize = _limit;
        if (_offset + _limit > totalCount) {
            resultSize = totalCount - _offset;
        }
        
        uint256[] memory eventIds = new uint256[](resultSize);
        uint256 currentIndex = 0;
        uint256 matchedCount = 0;
        
        for (uint256 i = 0; i < totalCollectionEvents && currentIndex < resultSize; i++) {
            if (collectionEvents[i].house == _houseAddress) {
                if (matchedCount >= _offset) {
                    eventIds[currentIndex] = i;
                    currentIndex++;
                }
                matchedCount++;
            }
        }
        
        return (eventIds, totalCount);
    }

    /**
     * Get collection events for a cleaner with pagination to avoid gas issues
     * @param _cleanerAddress Address of the cleaner
     * @param _offset Starting index for pagination
     * @param _limit Maximum number of events to return
     * @return Array of event IDs for the cleaner
     * @return Total count of events for this cleaner
     */
    function getCleanerCollectionEventsPaginated(
        address _cleanerAddress, 
        uint256 _offset, 
        uint256 _limit
    ) external view returns (uint256[] memory, uint256) {
        require(cleaners[_cleanerAddress].isRegistered, "Cleaner not registered");
        require(_limit > 0 && _limit <= 100, "Invalid limit: must be between 1 and 100");
        
        // Count total events first
        uint256 totalCount = 0;
        for (uint256 i = 0; i < totalCollectionEvents; i++) {
            if (collectionEvents[i].cleaner == _cleanerAddress) {
                totalCount++;
            }
        }
        
        if (_offset >= totalCount) {
            return (new uint256[](0), totalCount);
        }
        
        uint256 resultSize = _limit;
        if (_offset + _limit > totalCount) {
            resultSize = totalCount - _offset;
        }
        
        uint256[] memory eventIds = new uint256[](resultSize);
        uint256 currentIndex = 0;
        uint256 matchedCount = 0;
        
        for (uint256 i = 0; i < totalCollectionEvents && currentIndex < resultSize; i++) {
            if (collectionEvents[i].cleaner == _cleanerAddress) {
                if (matchedCount >= _offset) {
                    eventIds[currentIndex] = i;
                    currentIndex++;
                }
                matchedCount++;
            }
        }
        
        return (eventIds, totalCount);
    }

    /**
     * Get collection statistics for a house
     * @param _houseAddress Address of the house
     * @return totalEvents Total collection events for the house
     * @return confirmedEvents Number of confirmed collection events
     * @return pendingEvents Number of pending (unconfirmed) collection events
     */
    function getHouseCollectionStats(address _houseAddress) 
        external 
        view 
        returns (uint256 totalEvents, uint256 confirmedEvents, uint256 pendingEvents) 
    {
        require(houses[_houseAddress].isRegistered, "House not registered");
        
        for (uint256 i = 0; i < totalCollectionEvents; i++) {
            if (collectionEvents[i].house == _houseAddress) {
                totalEvents++;
                if (collectionEvents[i].confirmedByHouse) {
                    confirmedEvents++;
                } else {
                    pendingEvents++;
                }
            }
        }
    }

    /**
     * Get collection statistics for a cleaner
     * @param _cleanerAddress Address of the cleaner
     * @return totalEvents Total collection events by the cleaner
     * @return confirmedEvents Number of confirmed collection events
     * @return confirmationRate Percentage of confirmed collections (0-100)
     */
    function getCleanerCollectionStats(address _cleanerAddress) 
        external 
        view 
        returns (uint256 totalEvents, uint256 confirmedEvents, uint256 confirmationRate) 
    {
        require(cleaners[_cleanerAddress].isRegistered, "Cleaner not registered");
        
        for (uint256 i = 0; i < totalCollectionEvents; i++) {
            if (collectionEvents[i].cleaner == _cleanerAddress) {
                totalEvents++;
                if (collectionEvents[i].confirmedByHouse) {
                    confirmedEvents++;
                }
            }
        }
        
        if (totalEvents > 0) {
            confirmationRate = (confirmedEvents * 100) / totalEvents;
        }
    }

    // Neighborhood Query Functions
    /**
     * Get neighborhood information
     * @param _neighborhood Name of the neighborhood
     * @return Neighborhood struct containing all neighborhood information
     */
    function getNeighborhood(string memory _neighborhood) external view returns (Neighborhood memory) {
        require(bytes(neighborhoods[_neighborhood].name).length > 0, "Neighborhood doesn't exist");
        return neighborhoods[_neighborhood];
    }

    /**
     * Get all registered neighborhoods
     * @return Array of neighborhood names
     */
    function getAllNeighborhoods() external view returns (string[] memory) {
        return registeredNeighborhoods;
    }

    /**
     * Get neighborhoods assigned to a cleaner
     * @param _cleanerAddress Address of the cleaner
     * @return Array of neighborhood names where cleaner is authorized
     */
    function getCleanerNeighborhoods(address _cleanerAddress) external view returns (string[] memory) {
        require(cleaners[_cleanerAddress].isRegistered, "Cleaner not registered");
        return cleaners[_cleanerAddress].assignedNeighborhoods;
    }

    /**
     * Check if cleaner is authorized in neighborhood
     * @param _cleaner Address of the cleaner
     * @param _neighborhood Name of the neighborhood
     * @return Boolean indicating if cleaner is authorized
     */
    function isCleanerAuthorized(address _cleaner, string memory _neighborhood) external view returns (bool) {
        return cleanerNeighborhoodAccess[_neighborhood][_cleaner] || 
               neighborhoods[_neighborhood].admin == _cleaner ||
               _cleaner == owner;
    }

    /**
     * Check if address is a neighborhood admin
     * @param _address Address to check
     * @return Boolean indicating if address is a neighborhood admin
     */
    function isNeighborhoodAdmin(address _address) external view returns (bool) {
        return neighborhoodAdmins[_address] || _address == owner;
    }

    /**
     * Get neighborhood statistics
     * @param _neighborhood Name of the neighborhood
     * @return totalHouses Number of houses in neighborhood
     * @return totalCleaners Number of cleaners assigned to neighborhood
     * @return totalCollections Total collection events in neighborhood
     * @return confirmedCollections Number of confirmed collections
     * @return confirmationRate Percentage of confirmed collections (0-100)
     */
    function getNeighborhoodStats(string memory _neighborhood) 
        external 
        view 
        returns (
            uint256 totalHouses,
            uint256 totalCleaners,
            uint256 totalCollections,
            uint256 confirmedCollections,
            uint256 confirmationRate
        ) 
    {
        require(bytes(neighborhoods[_neighborhood].name).length > 0, "Neighborhood doesn't exist");
        
        Neighborhood memory neighborhood = neighborhoods[_neighborhood];
        totalHouses = neighborhood.totalHouses;
        totalCleaners = neighborhood.totalCleaners;
        totalCollections = neighborhood.totalCollections;
        confirmedCollections = neighborhood.confirmedCollections;
        
        if (totalCollections > 0) {
            confirmationRate = (confirmedCollections * 100) / totalCollections;
        }
    }

    // Utility Functions
    /**
     * Award points to a user and emit event
     * @param _recipient Address to receive points
     * @param _points Number of points to award
     * @param _reason Reason for awarding points
     */
    function awardPoints(address _recipient, uint256 _points, string memory _reason) internal {
        if (houses[_recipient].isRegistered) {
            houses[_recipient].points += _points;
        } else if (cleaners[_recipient].isRegistered) {
            cleaners[_recipient].points += _points;
        }
        
        emit PointsAwarded(_recipient, _points, _reason);
    }

    // View Functions
    /**
     * Get house information by address
     * @param _houseAddress Address of the house
     * @return House struct containing all house information
     */
    function getHouse(address _houseAddress) external view returns (House memory) {
        require(houses[_houseAddress].isRegistered, "House not registered");
        return houses[_houseAddress];
    }

    /**
     * Get cleaner information by address
     * @param _cleanerAddress Address of the cleaner
     * @return Cleaner struct containing all cleaner information
     */
    function getCleaner(address _cleanerAddress) external view returns (Cleaner memory) {
        require(cleaners[_cleanerAddress].isRegistered, "Cleaner not registered");
        return cleaners[_cleanerAddress];
    }

    /**
     * Get all houses in a neighborhood
     * @param _neighborhood Name of the neighborhood
     * @return Array of house addresses in the neighborhood
     */
    function getHousesInNeighborhood(string memory _neighborhood) external view returns (address[] memory) {
        return neighborhoodHouses[_neighborhood];
    }

    /**
     * Get all cleaners in a neighborhood
     * @param _neighborhood Name of the neighborhood
     * @return Array of cleaner addresses in the neighborhood
     */
    function getCleanersInNeighborhood(string memory _neighborhood) external view returns (address[] memory) {
        return neighborhoodCleaners[_neighborhood];
    }

    /**
     * Get total number of registered houses
     * @return Total number of houses
     */
    function getTotalHouses() external view returns (uint256) {
        return totalHouses;
    }

    /**
     * Get total number of registered cleaners
     * @return Total number of cleaners
     */
    function getTotalCleaners() external view returns (uint256) {
    
        return totalCleaners;
    }

    /**
     * Check if an address is a registered house
     * @param _address Address to check
     * @return Boolean indicating if address is a registered house
     */
    function isRegisteredHouse(address _address) external view returns (bool) {
        return houses[_address].isRegistered;
    }

    /**
     * Check if an address is a registered cleaner
     * @param _address Address to check
     * @return Boolean indicating if address is a registered cleaner
     */
    function isRegisteredCleaner(address _address) external view returns (bool) {
        return cleaners[_address].isRegistered;
    }

    /**
     * Get all registered house addresses
     * @return Array of all registered house addresses
     */
    function getAllRegisteredHouses() external view returns (address[] memory) {
        return registeredHouses;
    }

    /**
     * Get all registered cleaner addresses
     * @return Array of all registered cleaner addresses
     */
    function getAllRegisteredCleaners() external view returns (address[] memory) {
        return registeredCleaners;
    }

    // Owner Functions
    /**
     * Update house points (only owner)
     * @param _houseAddress Address of the house
     * @param _points New points value
     */
    function updateHousePoints(address _houseAddress, uint256 _points) external isOwner {
        require(houses[_houseAddress].isRegistered, "House not registered");
        houses[_houseAddress].points = _points;
    }

    /**
     * Update cleaner reputation (only owner)
     * @param _cleanerAddress Address of the cleaner
     * @param _reputation New reputation value
     */
    function updateCleanerReputation(address _cleanerAddress, uint256 _reputation) external isOwner {
        require(cleaners[_cleanerAddress].isRegistered, "Cleaner not registered");
        cleaners[_cleanerAddress].reputation = _reputation;
    }

    // Administrative Functions
    /**
     * Pause or unpause the contract (emergency function)
     * @param _paused New pause state
     */
    function pauseContract(bool _paused) external isOwner {
        contractPaused = _paused;
        emit ContractPaused(_paused);
    }

    /**
     * Batch assign multiple cleaners to a neighborhood
     * @param _cleaners Array of cleaner addresses
     * @param _neighborhood Name of the neighborhood
     */
    function batchAssignCleanersToNeighborhood(
        address[] memory _cleaners,
        string memory _neighborhood
    ) 
        external 
        onlyNeighborhoodAdmin(_neighborhood)
        whenNotPaused
    {
        require(_cleaners.length > 0, "No cleaners provided");
        require(neighborhoods[_neighborhood].isActive, "Neighborhood not active");
        
        for (uint256 i = 0; i < _cleaners.length; i++) {
            address cleaner = _cleaners[i];
            if (cleaners[cleaner].isRegistered && !cleanerNeighborhoodAccess[_neighborhood][cleaner]) {
                cleanerNeighborhoodAccess[_neighborhood][cleaner] = true;
                cleaners[cleaner].assignedNeighborhoods.push(_neighborhood);
                neighborhoodCleaners[_neighborhood].push(cleaner); // FIXED: Add to neighborhood cleaners array
                neighborhoods[_neighborhood].totalCleaners++;
                
                emit CleanerAssignedToNeighborhood(cleaner, _neighborhood);
            }
        }
    }

    /**
     * Batch remove multiple cleaners from a neighborhood
     * @param _cleaners Array of cleaner addresses
     * @param _neighborhood Name of the neighborhood
     */
    function batchRemoveCleanersFromNeighborhood(
        address[] memory _cleaners,
        string memory _neighborhood
    ) 
        external 
        onlyNeighborhoodAdmin(_neighborhood)
        whenNotPaused
    {
        require(_cleaners.length > 0, "No cleaners provided");
        
        for (uint256 i = 0; i < _cleaners.length; i++) {
            address cleaner = _cleaners[i];
            if (cleanerNeighborhoodAccess[_neighborhood][cleaner]) {
                cleanerNeighborhoodAccess[_neighborhood][cleaner] = false;
                
                // Remove from cleaner's assigned neighborhoods array
                string[] storage assigned = cleaners[cleaner].assignedNeighborhoods;
                for (uint256 j = 0; j < assigned.length; j++) {
                    if (keccak256(abi.encodePacked(assigned[j])) == keccak256(abi.encodePacked(_neighborhood))) {
                        assigned[j] = assigned[assigned.length - 1];
                        assigned.pop();
                        break;
                    }
                }
                
                // FIXED: Remove from neighborhood cleaners array
                address[] storage neighborhoodCleanersList = neighborhoodCleaners[_neighborhood];
                for (uint256 k = 0; k < neighborhoodCleanersList.length; k++) {
                    if (neighborhoodCleanersList[k] == cleaner) {
                        neighborhoodCleanersList[k] = neighborhoodCleanersList[neighborhoodCleanersList.length - 1];
                        neighborhoodCleanersList.pop();
                        break;
                    }
                }
                
                neighborhoods[_neighborhood].totalCleaners--;
                emit CleanerRemovedFromNeighborhood(cleaner, _neighborhood);
            }
        }
    }

    /**
     * Get contract pause status
     * @return Boolean indicating if contract is paused
     */
    function isPaused() external view returns (bool) {
        return contractPaused;
    }

    /**
     * Get total number of registered neighborhoods
     * @return Total number of neighborhoods
     */
    function getTotalNeighborhoods() external view returns (uint256) {
        return registeredNeighborhoods.length;
    }

    /**
     * Function that allows the contract to receive ETH
     */
    receive() external payable {}

    /**
     * FIXED: Validate that a neighborhood exists before operations
     * @param _neighborhood Name of the neighborhood to check
     * @return Boolean indicating if neighborhood exists and is active
     */
    function validateNeighborhoodExists(string memory _neighborhood) external view returns (bool) {
        return bytes(neighborhoods[_neighborhood].name).length > 0 && neighborhoods[_neighborhood].isActive;
    }

    /**
     * FIXED: Check for duplicate cleaner assignment more efficiently
     * @param _cleaner Address of the cleaner
     * @param _neighborhood Name of the neighborhood
     * @return Boolean indicating if cleaner is already assigned
     */
    function isCleanerAlreadyAssigned(address _cleaner, string memory _neighborhood) external view returns (bool) {
        return cleanerNeighborhoodAccess[_neighborhood][_cleaner];
    }

    /**
     * Get all collection events for a specific house (DEPRECATED - use paginated version)
     * @param _houseAddress Address of the house
     * @return Array of event IDs for the house
     * @dev This function may run out of gas with large datasets. Use getHouseCollectionEventsPaginated instead.
     */
    function getHouseCollectionEvents(address _houseAddress) external view returns (uint256[] memory) {
        require(houses[_houseAddress].isRegistered, "House not registered");
        
        uint256[] memory eventIds = new uint256[](totalCollectionEvents);
        uint256 count = 0;
        
        for (uint256 i = 0; i < totalCollectionEvents; i++) {
            if (collectionEvents[i].house == _houseAddress) {
                eventIds[count] = i;
                count++;
            }
        }
        
        // Create properly sized array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = eventIds[i];
        }
        
        return result;
    }

    /**
     * Get all collection events for a specific cleaner (DEPRECATED - use paginated version)
     * @param _cleanerAddress Address of the cleaner
     * @return Array of event IDs for the cleaner
     * @dev This function may run out of gas with large datasets. Use getCleanerCollectionEventsPaginated instead.
     */
    function getCleanerCollectionEvents(address _cleanerAddress) external view returns (uint256[] memory) {
        require(cleaners[_cleanerAddress].isRegistered, "Cleaner not registered");
        
        uint256[] memory eventIds = new uint256[](totalCollectionEvents);
        uint256 count = 0;
        
        for (uint256 i = 0; i < totalCollectionEvents; i++) {
            if (collectionEvents[i].cleaner == _cleanerAddress) {
                eventIds[count] = i;
                count++;
            }
        }
        
        // Create properly sized array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = eventIds[i];
        }
        
        return result;
    }
} 