using UnityEngine;
using Reown.AppKit.Unity;
using Reown.Sign.Models;

public class ReownTest : MonoBehaviour
{
    [Header("Reown Configuration")]
    [SerializeField] private string projectId = "YOUR_PROJECT_ID_HERE";
    [SerializeField] private string appName = "Vibe City";
    [SerializeField] private string appDescription = "A Unity game with Web3 integration";
    [SerializeField] private string appUrl = "https://example.com";
    [SerializeField] private string appIconUrl = "https://example.com/icon.png";

    private Account? currentAccount;

    async void Start()
    {
        // Only initialize if projectId is set
        if (string.IsNullOrEmpty(projectId) || projectId == "YOUR_PROJECT_ID_HERE")
        {
            Debug.LogWarning("ReownTest: Please set your Project ID in the inspector. Get one from https://cloud.reown.com/");
            return;
        }

        try
        {
            var metadata = new Metadata(
                name: appName,
                description: appDescription,
                url: appUrl,
                iconUrl: appIconUrl
            );

            var config = new AppKitConfig(projectId, metadata);

            await AppKit.InitializeAsync(config);
            Debug.Log("✅ Reown AppKit initialized successfully!");

            // Listen for account connection events
            AppKit.AccountConnected += OnAccountConnected;
            AppKit.AccountDisconnected += OnAccountDisconnected;

            // Check if already connected
            if (AppKit.IsAccountConnected)
            {
                currentAccount = await AppKit.GetAccountAsync();
                Debug.Log($"🔗 Already connected to: {currentAccount?.Address}");
            }
        }
        catch (System.Exception e)
        {
            Debug.LogError($"❌ Failed to initialize Reown AppKit: {e.Message}");
        }
    }

    private async void OnAccountConnected(object sender, System.EventArgs e)
    {
        currentAccount = await AppKit.GetAccountAsync();
        Debug.Log($"🔗 Account connected: {currentAccount?.Address}");
    }

    private void OnAccountDisconnected(object sender, System.EventArgs e)
    {
        currentAccount = null;
        Debug.Log("🔌 Account disconnected");
    }

    void OnGUI()
    {
        GUILayout.BeginArea(new Rect(10, 10, 300, 200));

        if (string.IsNullOrEmpty(projectId) || projectId == "YOUR_PROJECT_ID_HERE")
        {
            GUILayout.Label("⚠️ Please set Project ID in inspector");
            if (GUILayout.Button("Get Project ID"))
            {
                Application.OpenURL("https://cloud.reown.com/");
            }
        }
        else
        {
            GUILayout.Label("Reown AppKit Status: Ready");

            if (GUILayout.Button("Open Wallet Modal"))
            {
                AppKit.OpenModal();
            }

            if (AppKit.IsAccountConnected && currentAccount.HasValue)
            {
                GUILayout.Label($"Connected: {currentAccount.Value.Address}");
                if (GUILayout.Button("Disconnect"))
                {
                    _ = AppKit.DisconnectAsync();
                }
            }
            else
            {
                GUILayout.Label("Not connected");
            }
        }

        GUILayout.EndArea();
    }

    void OnDestroy()
    {
        // Clean up event listeners
        if (AppKit.Instance != null)
        {
            AppKit.AccountConnected -= OnAccountConnected;
            AppKit.AccountDisconnected -= OnAccountDisconnected;
        }
    }
}