# "My Plots" Expected Behavior - Test Scenarios

## Scenario 1: Owner Mints Plots (No Personal Purchases)

**Setup:**
- Owner mints 20 plots for "Greens land" project
- Owner does NOT purchase any plots themselves

**Expected Result in "My Plots" page:**
```
✅ CORRECT: "No plots owned yet" 
❌ WRONG: Shows all 20 plots
```

**Why?**
- When owner mints plots, `ownerOf(tokenId)` = **Contract Address**
- Not owner's personal wallet address
- Owner ≠ Contract Owner for NFTs

---

## Scenario 2: Owner Buys a Plot

**Setup:**
- Owner mints 20 plots
- Owner purchases Plot #5 for 2.5 ETH

**Expected Result in "My Plots" page:**
```
✅ CORRECT: Shows 1 plot (Plot #5)
❌ WRONG: Shows all 20 plots
```

**Why?**
- After purchase: `ownerOf(5)` = Owner's wallet address
- Other plots: `ownerOf(1-4, 6-20)` = Contract address
- Only Plot #5 should appear

---

## Scenario 3: Regular User Buys Plots

**Setup:**
- User (0xABC...123) buys Plot #1 and Plot #2
- User (0xDEF...456) buys Plot #3

**Expected Result for User 0xABC...123:**
```
✅ CORRECT: Shows 2 plots (Plot #1 and #2)
❌ WRONG: Shows 0 plots or all plots
```

**Expected Result for User 0xDEF...456:**
```
✅ CORRECT: Shows 1 plot (Plot #3)
```

---

## Debug Checklist

### Step 1: Open Browser Console (F12)
Look for these console logs:
```
🔍 Fetching plots for user: 0x3b3e4...fbc1
📊 Total supply: 20
Token 1 owner: 0x991A52... (Contract address)
❌ Token 1 belongs to someone else
Token 2 owner: 0x991A52... (Contract address)
❌ Token 2 belongs to someone else
...
🎯 User plots: []
```

### Step 2: Verify Contract vs Owner Address
Run in console:
```javascript
// Get contract address
console.log("Contract:", "0x991A529358D2dEc2Afc3E45800205fFC602f0586");

// Get your wallet address
console.log("Your wallet:", window.ethereum.selectedAddress);

// These should be DIFFERENT!
```

### Step 3: Check ownerOf for Specific Token
In console:
```javascript
// Replace with your actual contract address
const contract = new ethers.Contract(
  "0x991A529358D2dEc2Afc3E45800205fFC602f0586",
  ABI,
  provider
);

// Check who owns token 1
const owner = await contract.ownerOf(1);
console.log("Token 1 owner:", owner);
```

---

## Common Confusion

### ❓ "I'm the contract owner, why don't I see minted plots?"

**Answer:** 
- You are the **admin/deployer** of the smart contract
- But minted plots are owned by the **contract itself**, not you personally
- To see a plot in "My Plots", you must **buy it** like any other user

### ❓ "What's the difference between Contract Owner and NFT Owner?"

**Contract Owner (you):**
- Deployed the smart contract
- Can create projects
- Can mint plots
- Can deactivate projects

**NFT Owner (anyone):**
- Purchased/received a specific plot NFT
- Owns the tokenId
- Can list it for resale
- Can transfer it

They are **different roles**!

---

## Fix If Showing All Plots Incorrectly

If "My Plots" is showing plots you don't own:

### Check 1: Verify getUserPlots function
```typescript
// Should have this comparison:
if (owner.toLowerCase() === userAddress.toLowerCase()) {
  userPlots.push(tokenId);
}
```

### Check 2: Verify useUserOwnedPlots hook
```typescript
// Should pass the user's wallet address:
const { plots, loading } = useUserOwnedPlots(account);
```

### Check 3: Verify smart contract ownerOf
The smart contract must implement ERC721 correctly:
```solidity
function ownerOf(uint256 tokenId) public view returns (address) {
    return _owners[tokenId]; // Should return actual owner
}
```

---

## Test the Fix

1. **Clear browser cache and reload**
2. **Open console (F12)** → Look for debug logs
3. **Go to "My Plots" page**
4. **Expected**: Should only show plots YOU purchased
5. **If empty**: Good! Mint and buy a plot to test
6. **If shows all**: Check console logs for owner addresses

---

## Summary

✅ **My Plots page should ONLY show:**
- Plots where `ownerOf(tokenId)` equals YOUR wallet address
- Plots YOU personally purchased with ETH
- NOT plots owned by the contract (even if you're the contract owner)

❌ **My Plots page should NOT show:**
- Plots owned by the contract
- Plots owned by other users
- Unminted plots
