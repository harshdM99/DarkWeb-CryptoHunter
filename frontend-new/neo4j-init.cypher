CALL graphql.createQueryIndex();
CALL graphql.createSchema( 
    'type Address {
        id: ID!
        transactions: [Transaction] @relationship(type: "SENT", direction: OUT)
    }
    
    type Transaction {
        amount: Float
        receiver: Address @relationship(type: "SENT", direction: IN)
        sender: Address @relationship(type: "SENT", direction: OUT)
    }'
);