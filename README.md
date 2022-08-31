# Technical test from Metav.rs
## Concept
- We want to do a 100 NFTs mint sale.  
- You have to click a specific button to trigger the mint : no contract mint should
be allowed.  
- Mint cost should be payed by the user.  
- Just focus on the smart contracts, no need to develop neither frontend or backend.  
## How does it works ?
1. User clicks on the mint button on the frontend page ;
2. Frontend sends a request to the backend to start listening to OnePlaceMint.Payed ;
3. Backend starts listening to the OnePlaceMint.Payed event filtering on the user ;
4. Backend sends back to the frontend that it can trigger the mint payment ;
5. Frontend calls to OnePlaceMint.payMint() ;
4. User pay the mint which generates a OnePlaceMint.Payed event ;
5. Backend hook to this event and calls Nft.mint().
## Run the tests
> $ npm i  
> $ npx hardhat test
## What about the edge cases ?
### What happen if the tries to trick the frontend to pay without / before calling the backend ?
He will never receive his NFT ...
### What happen if the user try to contract mint ?
Nft.mint() is using the onlyRole(MINTER) modifier. Therefor the user will not be
able to mint.
### Can the user do the mint without clicking on the mint button ?
Yes, the user can still directly call the backend API to make it listen to the
OnePlaceMint.Payed event without going through the mint button and then contract
call OnePlaceMint.payMint(). That way, we can say that the real "button" is the
backend API as it will always needs to be called to trigger the mint.
