using UnityEngine;

[System.Serializable]
public class FirstPersonSetup : MonoBehaviour
{
    [Header("Setup Configuration")]
    public float playerHeight = 2f;
    public float cameraHeight = 1.8f;
    public Vector3 startPosition = new Vector3(0, 1, 0);
    
    [Header("Auto Setup")]
    [Tooltip("Click this button in the inspector to automatically create a first-person controller")]
    public bool autoSetup = false;
    
    void Start()
    {
        if (autoSetup)
        {
            SetupFirstPersonController();
        }
    }
    
    [ContextMenu("Setup First Person Controller")]
    public void SetupFirstPersonController()
    {
        // Create the main player GameObject
        GameObject player = new GameObject("FirstPersonPlayer");
        player.transform.position = startPosition;
        player.tag = "Player";
        
        // Add CharacterController
        CharacterController characterController = player.AddComponent<CharacterController>();
        characterController.height = playerHeight;
        characterController.radius = 0.5f;
        characterController.center = new Vector3(0, playerHeight / 2, 0);
        
        // Create camera GameObject
        GameObject cameraObject = new GameObject("PlayerCamera");
        cameraObject.transform.SetParent(player.transform);
        cameraObject.transform.localPosition = new Vector3(0, cameraHeight, 0);
        
        // Add Camera component
        Camera playerCamera = cameraObject.AddComponent<Camera>();
        playerCamera.fieldOfView = 60f;
        
        // Add AudioListener if there isn't one in the scene
        if (FindObjectOfType<AudioListener>() == null)
        {
            cameraObject.AddComponent<AudioListener>();
        }
        
        // Add FirstPersonController script
        player.AddComponent<FirstPersonController>();
        
        // Create ground check object
        GameObject groundCheck = new GameObject("GroundCheck");
        groundCheck.transform.SetParent(player.transform);
        groundCheck.transform.localPosition = new Vector3(0, -(playerHeight / 2) + 0.1f, 0);
        
        // Assign ground check to controller
        FirstPersonController controller = player.GetComponent<FirstPersonController>();
        controller.groundCheck = groundCheck.transform;
        
        Debug.Log("First Person Controller setup complete! Use arrow keys to move, mouse to look around, Space to jump.");
        
        // Disable this setup component after use
        this.enabled = false;
    }
    
    void OnValidate()
    {
        if (autoSetup)
        {
            autoSetup = false;
            SetupFirstPersonController();
        }
    }
}