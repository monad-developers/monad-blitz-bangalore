# 🏘️ Neighborhood Population Script

This script automatically creates 5 test neighborhoods in your CleanChain contract for testing purposes.

## 🚀 Quick Start

```bash
# From the hardhat package directory
cd packages/hardhat

# Run the population script
yarn populate-neighborhoods
```

## 📋 What it creates

The script will register these 5 neighborhoods:

1. **Downtown District** - Central business district with mixed use
2. **Green Valley** - Suburban residential with families  
3. **Riverside Community** - Waterfront condos and townhouses
4. **Industrial Park** - Mixed industrial and worker housing
5. **University Heights** - Student housing near campus

## 🔐 Requirements

- The script uses the first Hardhat account as the contract owner
- Make sure your `.env` file has the correct `DEPLOYER_PRIVATE_KEY`
- The contract must not be paused
- You must be the contract owner to register neighborhoods

## 🛠️ Customization

### Using Different Admin Addresses

Edit `scripts/populate-neighborhoods.js` and replace the admin addresses with real addresses:

```javascript
const neighborhoods = [
  {
    name: "Downtown District",
    description: "Your description...",
    admin: "0xYourRealAdminAddress1" // Replace with actual admin
  },
  // ... more neighborhoods
];
```

### Adding More Neighborhoods

Just add more objects to the `neighborhoods` array in the script.

## 📊 What happens after running

1. ✅ 5 neighborhoods are registered
2. 🌐 Visit `http://localhost:3000/neighborhoods/view` to see them
3. 🏠 Households can now register in these neighborhoods
4. 👥 Admins can assign cleaners to their neighborhoods
5. 🧹 Start testing the full garbage collection workflow

## 🔧 Troubleshooting

**"Signer is not the contract owner"**
- Make sure your `.env` has the correct `DEPLOYER_PRIVATE_KEY`
- The script uses the same private key that deployed the contract

**"Contract is paused"**
- The contract owner needs to unpause the contract first

**"Neighborhood already exists"**
- The script skips existing neighborhoods automatically
- You can run it multiple times safely

## 🚀 Next Steps

After populating neighborhoods:

1. **Register as cleaner**: Visit `/clean/register`
2. **Register households**: Visit `/households/register` 
3. **Manage neighborhoods**: Visit `/neighborhoods/manage` (as admin)
4. **View all data**: Visit `/neighborhoods/view`

## 🔄 Re-running the script

The script is safe to run multiple times - it will skip neighborhoods that already exist. 