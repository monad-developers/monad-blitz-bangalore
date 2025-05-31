using UnityEngine;

public class FirstPersonController : MonoBehaviour
{
    [Header("Movement Settings")]
    public float walkSpeed = 5f;
    public float runSpeed = 10f;
    public float jumpForce = 8f;
    public float gravity = -9.81f;
    public float groundCheckDistance = 0.4f;
    
    [Header("Mouse Look Settings")]
    public float mouseSensitivity = 100f;
    public float upDownRange = 60f;
    
    [Header("Ground Check")]
    public LayerMask groundMask = 1;
    public Transform groundCheck;
    
    private CharacterController characterController;
    private Camera playerCamera;
    private Vector3 velocity;
    private bool isGrounded;
    private float verticalRotation = 0;
    
    void Start()
    {
        characterController = GetComponent<CharacterController>();
        playerCamera = GetComponentInChildren<Camera>();
        
        // Lock cursor to center of screen
        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;
        
        // If no ground check transform is assigned, create one
        if (groundCheck == null)
        {
            GameObject groundCheckObject = new GameObject("GroundCheck");
            groundCheckObject.transform.SetParent(transform);
            groundCheckObject.transform.localPosition = new Vector3(0, -characterController.height / 2, 0);
            groundCheck = groundCheckObject.transform;
        }
    }
    
    void Update()
    {
        HandleMouseLook();
        HandleMovement();
        HandleJumping();
    }
    
    void HandleMouseLook()
    {
        // Get mouse input
        float mouseX = Input.GetAxis("Mouse X") * mouseSensitivity * Time.deltaTime;
        float mouseY = Input.GetAxis("Mouse Y") * mouseSensitivity * Time.deltaTime;
        
        // Rotate the player body horizontally
        transform.Rotate(Vector3.up * mouseX);
        
        // Rotate the camera vertically
        verticalRotation -= mouseY;
        verticalRotation = Mathf.Clamp(verticalRotation, -upDownRange, upDownRange);
        playerCamera.transform.localRotation = Quaternion.Euler(verticalRotation, 0f, 0f);
    }
    
    void HandleMovement()
    {
        // Check if grounded
        isGrounded = Physics.CheckSphere(groundCheck.position, groundCheckDistance, groundMask);
        
        if (isGrounded && velocity.y < 0)
        {
            velocity.y = -2f;
        }
        
        // Get input
        float horizontal = 0f;
        float vertical = 0f;
        
        // Arrow keys input
        if (Input.GetKey(KeyCode.LeftArrow))
            horizontal = -1f;
        else if (Input.GetKey(KeyCode.RightArrow))
            horizontal = 1f;
            
        if (Input.GetKey(KeyCode.UpArrow))
            vertical = 1f;
        else if (Input.GetKey(KeyCode.DownArrow))
            vertical = -1f;
        
        // WASD as alternative
        if (horizontal == 0f)
            horizontal = Input.GetAxis("Horizontal");
        if (vertical == 0f)
            vertical = Input.GetAxis("Vertical");
        
        // Calculate movement direction
        Vector3 direction = transform.right * horizontal + transform.forward * vertical;
        
        // Determine speed (hold Shift to run)
        float currentSpeed = Input.GetKey(KeyCode.LeftShift) ? runSpeed : walkSpeed;
        
        // Move the character
        characterController.Move(direction * currentSpeed * Time.deltaTime);
    }
    
    void HandleJumping()
    {
        // Jump input (Space or Up Arrow + Shift)
        if ((Input.GetKeyDown(KeyCode.Space) || (Input.GetKey(KeyCode.UpArrow) && Input.GetKey(KeyCode.LeftShift))) && isGrounded)
        {
            velocity.y = Mathf.Sqrt(jumpForce * -2f * gravity);
        }
        
        // Apply gravity
        velocity.y += gravity * Time.deltaTime;
        characterController.Move(velocity * Time.deltaTime);
    }
    
    void OnDrawGizmosSelected()
    {
        // Draw ground check sphere in scene view
        if (groundCheck != null)
        {
            Gizmos.color = isGrounded ? Color.green : Color.red;
            Gizmos.DrawWireSphere(groundCheck.position, groundCheckDistance);
        }
    }
}