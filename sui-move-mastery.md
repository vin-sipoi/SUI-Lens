# The Complete Guide to Becoming an Exceptional Sui Move Developer

## Table of Contents
1. [Sui Blockchain Fundamentals](#sui-blockchain-fundamentals)
2. [Move Language Core Concepts](#move-language-core-concepts)
3. [Sui Move Object Model](#sui-move-object-model)
4. [Essential Design Patterns](#essential-design-patterns)
5. [Security Best Practices](#security-best-practices)
6. [Testing and Debugging](#testing-and-debugging)
7. [Gas Optimization](#gas-optimization)
8. [DeFi Development](#defi-development)
9. [NFT and Digital Assets](#nft-and-digital-assets)
10. [Development Tools and Workflow](#development-tools-and-workflow)
11. [Advanced Topics](#advanced-topics)
12. [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)

## Sui Blockchain Fundamentals

### Object-Centric Architecture

Sui's revolutionary approach treats everything as objects, fundamentally different from account-based blockchains:

```move
// In Sui, everything is an object with a unique ID
struct MyObject has key {
    id: UID,
    value: u64,
    owner: address
}
```

**Key Advantages:**
- **Parallel Execution**: Transactions touching different objects execute simultaneously
- **Direct Ownership**: Objects can be owned by addresses or other objects
- **Fast Path Transactions**: Single-owner operations skip consensus entirely

### Transaction Model

#### Programmable Transaction Blocks (PTBs)
```move
// PTBs allow composing multiple operations atomically
// Up to 1024 commands in a single transaction
public fun complex_operation(
    coin1: Coin<SUI>,
    coin2: Coin<SUI>,
    amount: u64,
    ctx: &mut TxContext
) {
    let merged = coin::join(coin1, coin2);
    let split_coin = coin::split(&mut merged, amount, ctx);
    // More operations...
}
```

#### Transaction Types
1. **Single-Owner**: Fast path, sub-second finality
2. **Shared Object**: Requires consensus, ~2-3 second finality
3. **Sponsored**: Gas paid by third party

### Gas Model

```move
// Gas in Sui is predictable and efficient
// Computation gas is rounded to buckets for predictability
// Storage gas includes:
// 1. Storage Fund contribution (refundable)
// 2. Execution cost
```

**Gas Optimization Principles:**
- Batch operations using PTBs
- Minimize storage changes
- Use efficient data structures

## Move Language Core Concepts

### Resource-Oriented Programming

Move's linear type system ensures resources cannot be copied or discarded:

```move
// Resources have restricted abilities
struct Money has store {
    amount: u64
}

// This won't compile - no copy ability
// let money_copy = money; // ERROR!

// Must explicitly transfer or consume
public fun transfer_money(money: Money, recipient: address) {
    transfer::public_transfer(money, recipient);
}
```

### Abilities System

```move
// Four abilities control how types can be used
struct Example has copy, drop, store, key {
    // copy: Can be copied
    // drop: Can be discarded
    // store: Can be stored in global storage
    // key: Can be a key for global storage (Sui objects)
}

// Common patterns:
struct Coin has store { }  // Can be stored but not accidentally dropped
struct Receipt has drop { } // Can be discarded after use
struct NFT has key, store { id: UID } // Sui object that can be stored
```

### Generics and Type Parameters

```move
// Generic programming for reusable code
public struct Container<T: store> has key {
    id: UID,
    contents: T
}

// Phantom types for type safety without storage
public struct Witness<phantom T> has drop {
    // Phantom type parameter doesn't affect storage
}

// Type constraints
public fun process<T: copy + drop>(value: T) {
    // T must have both copy and drop abilities
}
```

### Module Structure

```move
module package::module_name {
    // Imports
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    
    // Constants
    const E_INVALID_AMOUNT: u64 = 0;
    const MAX_SUPPLY: u64 = 1_000_000;
    
    // Structs
    public struct MyObject has key {
        id: UID,
        value: u64
    }
    
    // Module initializer - runs once on deployment
    fun init(ctx: &mut TxContext) {
        // One-time setup
    }
    
    // Public functions
    public fun create(value: u64, ctx: &mut TxContext): MyObject {
        MyObject {
            id: object::new(ctx),
            value
        }
    }
    
    // Entry functions - callable from transactions
    public entry fun transfer_object(obj: MyObject, recipient: address) {
        transfer::transfer(obj, recipient);
    }
}
```

## Sui Move Object Model

### Object Types

#### 1. Owned Objects
```move
public struct OwnedNFT has key, store {
    id: UID,
    name: String,
    // Owned by a single address
}

// Creating owned object
public fun mint_nft(name: String, ctx: &mut TxContext) {
    let nft = OwnedNFT {
        id: object::new(ctx),
        name
    };
    // Transfer to sender
    transfer::transfer(nft, tx_context::sender(ctx));
}
```

#### 2. Shared Objects
```move
public struct SharedPool has key {
    id: UID,
    total_liquidity: u64,
    // Accessible by anyone
}

// Creating shared object
public fun create_pool(ctx: &mut TxContext) {
    let pool = SharedPool {
        id: object::new(ctx),
        total_liquidity: 0
    };
    // Make it shared
    transfer::share_object(pool);
}

// Modifying shared object requires consensus
public fun add_liquidity(pool: &mut SharedPool, amount: u64) {
    pool.total_liquidity = pool.total_liquidity + amount;
}
```

#### 3. Immutable Objects
```move
public struct Config has key {
    id: UID,
    version: u64,
    parameters: vector<u8>
}

// Creating immutable object
public fun publish_config(params: vector<u8>, ctx: &mut TxContext) {
    let config = Config {
        id: object::new(ctx),
        version: 1,
        parameters: params
    };
    // Freeze makes it immutable
    transfer::freeze_object(config);
}
```

### Object Wrapping and Dynamic Fields

#### Object Wrapping
```move
public struct Wrapper has key {
    id: UID,
    inner: Item  // Item doesn't need key ability
}

public struct Item has store {
    value: u64
}

// Wrapping allows non-key objects to exist in storage
public fun wrap_item(item: Item, ctx: &mut TxContext) {
    let wrapper = Wrapper {
        id: object::new(ctx),
        inner: item
    };
    transfer::transfer(wrapper, tx_context::sender(ctx));
}
```

#### Dynamic Fields
```move
use sui::dynamic_field;

public struct Profile has key {
    id: UID,
    name: String
}

// Add any type as dynamic field
public fun add_attribute<T: store>(
    profile: &mut Profile,
    key: String,
    value: T
) {
    dynamic_field::add(&mut profile.id, key, value);
}

// Retrieve dynamic field
public fun get_attribute<T: store + copy>(
    profile: &Profile,
    key: String
): T {
    *dynamic_field::borrow<String, T>(&profile.id, key)
}
```

#### Dynamic Object Fields
```move
use sui::dynamic_object_field;

// For storing objects specifically
public fun add_nft(profile: &mut Profile, name: String, nft: NFT) {
    dynamic_object_field::add(&mut profile.id, name, nft);
}

// Objects can be retrieved by their ID even when stored as dynamic fields
```

## Essential Design Patterns

### Witness Pattern

The witness pattern provides one-time proof of module authority:

```move
// Witness type - has drop, created only in init
public struct WITNESS has drop {}

// Treasury capability requires witness
public struct TreasuryCap<phantom T> has key, store {
    id: UID,
    total_supply: u64
}

// Module initializer creates witness
fun init(witness: WITNESS, ctx: &mut TxContext) {
    // WITNESS proves this is called by module publisher
    let treasury = TreasuryCap<WITNESS> {
        id: object::new(ctx),
        total_supply: 0
    };
    transfer::transfer(treasury, tx_context::sender(ctx));
}
```

### Capability Pattern

Capabilities control access to privileged operations:

```move
public struct AdminCap has key, store {
    id: UID
}

public struct MinterCap has key, store {
    id: UID,
    limit: u64  // Can enforce limits
}

// Only capability holder can mint
public fun mint<T>(cap: &MinterCap, amount: u64): Coin<T> {
    assert!(amount <= cap.limit, E_EXCEEDS_LIMIT);
    // Mint logic
}

// Capability can be transferred or shared
public fun transfer_admin(cap: AdminCap, new_admin: address) {
    transfer::transfer(cap, new_admin);
}
```

### Hot Potato Pattern

Forces handling in the same transaction:

```move
// No abilities - must be consumed
public struct FlashLoan {
    amount: u64,
    fee: u64
}

public fun borrow(pool: &mut Pool, amount: u64): (Coin<SUI>, FlashLoan) {
    let loan = FlashLoan { amount, fee: amount / 100 };
    let coin = extract_from_pool(pool, amount);
    (coin, loan)
}

// Must be called in same transaction
public fun repay(pool: &mut Pool, payment: Coin<SUI>, loan: FlashLoan) {
    let FlashLoan { amount, fee } = loan; // Destructure to consume
    assert!(coin::value(&payment) >= amount + fee, E_INSUFFICIENT);
    deposit_to_pool(pool, payment);
}
```

### One-Time Witness Pattern

```move
// OTW has same name as module, gets drop ability
public struct MY_COIN has drop {}

fun init(witness: MY_COIN, ctx: &mut TxContext) {
    // witness proves this is the module's init function
    let (treasury, metadata) = coin::create_currency(
        witness,
        9, // decimals
        b"MYC",
        b"My Coin",
        b"Description",
        option::none(),
        ctx
    );
    // Can only create currency once per type
}
```

### Publisher Pattern

```move
use sui::package;

fun init(otw: MY_MODULE, ctx: &mut TxContext) {
    // Create publisher object for module authority
    let publisher = package::claim(otw, ctx);
    
    // Publisher proves module ownership
    // Used for:
    // - Display standards
    // - Transfer policies
    // - Kiosk rules
    
    transfer::public_transfer(publisher, tx_context::sender(ctx));
}
```

## Security Best Practices

### Input Validation

```move
// Always validate inputs
const E_INVALID_AMOUNT: u64 = 1;
const E_DEADLINE_PASSED: u64 = 2;
const E_UNAUTHORIZED: u64 = 3;

public fun swap(
    pool: &mut Pool,
    input: Coin<SUI>,
    min_output: u64,
    deadline: u64,
    clock: &Clock,
    ctx: &TxContext
) {
    // Check deadline
    assert!(clock::timestamp_ms(clock) <= deadline, E_DEADLINE_PASSED);
    
    // Validate amounts
    assert!(coin::value(&input) > 0, E_INVALID_AMOUNT);
    
    // Check slippage protection
    let output_amount = calculate_output(pool, coin::value(&input));
    assert!(output_amount >= min_output, E_INSUFFICIENT_OUTPUT);
    
    // Proceed with swap
}
```

### Access Control

```move
// Role-based access control
public struct Roles has key {
    id: UID,
    admins: vector<address>,
    operators: vector<address>
}

public fun admin_only(roles: &Roles, ctx: &TxContext) {
    assert!(
        vector::contains(&roles.admins, &tx_context::sender(ctx)),
        E_UNAUTHORIZED
    );
}

// Object-based access control
public struct Vault<phantom T> has key {
    id: UID,
    balance: Balance<T>,
    // Access controlled by object ownership
}

// Timelock pattern
public struct Timelock has key {
    id: UID,
    unlock_time: u64,
    beneficiary: address
}
```

### Reentrancy Protection

```move
// Sui's model prevents reentrancy by design
// No dynamic dispatch or callbacks
// But still follow checks-effects-interactions pattern

public fun withdraw(
    vault: &mut Vault<SUI>,
    amount: u64,
    ctx: &mut TxContext
) {
    // 1. Checks
    assert!(balance::value(&vault.balance) >= amount, E_INSUFFICIENT);
    
    // 2. Effects (update state first)
    let withdrawn = balance::split(&mut vault.balance, amount);
    
    // 3. Interactions (external calls last)
    let coin = coin::from_balance(withdrawn, ctx);
    transfer::public_transfer(coin, tx_context::sender(ctx));
}
```

### Integer Overflow Protection

```move
// Move automatically aborts on overflow
let result = a + b; // Aborts if overflow

// For explicit checking:
use std::u64;

public fun safe_multiply(a: u64, b: u64): u64 {
    assert!(b == 0 || a <= (U64::MAX / b), E_OVERFLOW);
    a * b
}

// Use constants for limits
const MAX_SUPPLY: u64 = 1_000_000_000;
const BASIS_POINTS: u64 = 10_000;

public fun calculate_fee(amount: u64, fee_bps: u64): u64 {
    // Fee in basis points (1 bp = 0.01%)
    assert!(fee_bps <= BASIS_POINTS, E_INVALID_FEE);
    (amount * fee_bps) / BASIS_POINTS
}
```

### Flash Loan Attack Prevention

```move
// Use hot potato pattern
public struct FlashLoan {
    pool_id: ID,
    amount: u64,
    fee: u64
}

// Price oracle manipulation prevention
public struct PriceOracle has key {
    id: UID,
    prices: Table<String, PriceData>,
}

public struct PriceData has store {
    value: u64,
    timestamp: u64,
    sources: vector<address>  // Multiple price sources
}

// Time-weighted average price (TWAP)
public fun update_twap(
    oracle: &mut PriceOracle,
    new_price: u64,
    clock: &Clock
) {
    // Implement TWAP logic to prevent manipulation
}
```

## Testing and Debugging

### Unit Testing Framework

```move
#[test_only]
module package::module_tests {
    use package::module;
    use sui::test_scenario::{Self, Scenario};
    use sui::test_utils;
    
    #[test]
    fun test_create_object() {
        let mut scenario = test_scenario::begin(@0x1);
        
        // First transaction
        test_scenario::next_tx(&mut scenario, @0x1);
        {
            module::create_object(100, test_scenario::ctx(&mut scenario));
        };
        
        // Second transaction - verify object created
        test_scenario::next_tx(&mut scenario, @0x1);
        {
            let object = test_scenario::take_from_sender<MyObject>(&scenario);
            assert!(module::get_value(&object) == 100, 0);
            test_scenario::return_to_sender(&scenario, object);
        };
        
        test_scenario::end(scenario);
    }
    
    #[test]
    #[expected_failure(abort_code = module::E_INVALID_AMOUNT)]
    fun test_invalid_amount() {
        let mut scenario = test_scenario::begin(@0x1);
        test_scenario::next_tx(&mut scenario, @0x1);
        {
            // This should abort
            module::create_object(0, test_scenario::ctx(&mut scenario));
        };
        test_scenario::end(scenario);
    }
}
```

### Integration Testing

```move
#[test]
fun test_complex_flow() {
    let mut scenario = test_scenario::begin(@0x1);
    let alice = @0x1;
    let bob = @0x2;
    
    // Setup phase
    test_scenario::next_tx(&mut scenario, alice);
    {
        module::init_for_testing(test_scenario::ctx(&mut scenario));
    };
    
    // Alice creates and shares pool
    test_scenario::next_tx(&mut scenario, alice);
    {
        let pool = module::create_pool(test_scenario::ctx(&mut scenario));
        transfer::public_share_object(pool);
    };
    
    // Bob interacts with shared pool
    test_scenario::next_tx(&mut scenario, bob);
    {
        let mut pool = test_scenario::take_shared<Pool>(&scenario);
        module::add_liquidity(&mut pool, 1000);
        test_scenario::return_shared(pool);
    };
    
    test_scenario::end(scenario);
}
```

### Debugging Techniques

```move
// Debug print in tests
#[test_only]
use std::debug;

#[test]
fun test_with_debugging() {
    let value = calculate_something();
    debug::print(&value);  // Prints to console during test
    
    let complex_struct = MyStruct { /* ... */ };
    debug::print(&complex_struct);
}

// Assertions for debugging
public fun process_transaction(amount: u64) {
    // Temporary assertions during development
    assert!(amount > 0, 999); // Use unique codes for easy identification
    assert!(amount <= MAX_AMOUNT, 998);
}

// Event emission for debugging
public struct DebugEvent has copy, drop {
    message: String,
    value: u64,
    timestamp: u64
}

public fun complex_operation(clock: &Clock) {
    // Emit events to track execution
    event::emit(DebugEvent {
        message: string::utf8(b"Operation started"),
        value: 42,
        timestamp: clock::timestamp_ms(clock)
    });
}
```

### Test Utilities

```move
#[test_only]
public fun create_test_coins(
    amount: u64,
    ctx: &mut TxContext
): Coin<SUI> {
    // Helper function for tests
    coin::mint_for_testing<SUI>(amount, ctx)
}

#[test_only]
public struct TestHelper {
    scenario: Scenario,
    admin: address,
    users: vector<address>
}

#[test_only]
public fun setup_test(): TestHelper {
    let mut scenario = test_scenario::begin(@0x1);
    let admin = @0x1;
    let users = vector[@0x2, @0x3, @0x4];
    
    // Common setup
    test_scenario::next_tx(&mut scenario, admin);
    {
        init_for_testing(test_scenario::ctx(&mut scenario));
    };
    
    TestHelper { scenario, admin, users }
}
```

## Gas Optimization

### Storage Optimization

```move
// Pack struct fields efficiently
// Bad - wasteful padding
public struct Inefficient has store {
    a: u8,      // 1 byte
    b: u64,     // 8 bytes (7 bytes padding before)
    c: u8,      // 1 byte
    d: u64,     // 8 bytes (7 bytes padding before)
}

// Good - minimized padding
public struct Efficient has store {
    b: u64,     // 8 bytes
    d: u64,     // 8 bytes
    a: u8,      // 1 byte
    c: u8,      // 1 byte
}

// Use vector for dynamic data
public struct OptimalStorage has key {
    id: UID,
    // Store only necessary data
    active_items: vector<ID>,  // Just IDs, not full objects
    metadata: Table<ID, ItemMetadata>  // Separate table for details
}
```

### Computation Optimization

```move
// Batch operations in PTBs
public fun batch_transfer(
    objects: vector<Item>,
    recipients: vector<address>
) {
    let len = vector::length(&objects);
    assert!(len == vector::length(&recipients), E_LENGTH_MISMATCH);
    
    let mut i = 0;
    while (i < len) {
        let obj = vector::pop_back(&mut objects);
        let recipient = *vector::borrow(&recipients, i);
        transfer::public_transfer(obj, recipient);
        i = i + 1;
    };
}

// Avoid redundant checks
public struct CachedData has store {
    value: u64,
    is_valid: bool,
    last_update: u64
}

public fun get_value(data: &CachedData, clock: &Clock): u64 {
    // Cache validation check
    if (data.is_valid && 
        clock::timestamp_ms(clock) - data.last_update < CACHE_DURATION) {
        return data.value
    };
    // Recompute only when necessary
}
```

### PTB Optimization

```move
// Maximize PTB usage
// Instead of multiple transactions:
// 1. Split coin
// 2. Transfer part
// 3. Use remainder

// Do in one PTB:
public fun split_and_transfer(
    coin: Coin<SUI>,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext
) {
    let split_coin = coin::split(&mut coin, amount, ctx);
    transfer::public_transfer(split_coin, recipient);
    transfer::public_transfer(coin, tx_context::sender(ctx));
}
```

### Table vs Dynamic Fields

```move
// Use Table for large collections
public struct Registry has key {
    id: UID,
    // Good for many items
    items: Table<address, Item>,
    count: u64
}

// Use dynamic fields for few items
public struct Profile has key {
    id: UID,
    // Good for small, fixed set of attributes
    // Access via: dynamic_field::add(&mut profile.id, b"avatar", avatar_url)
}

// Benchmark based on use case
// Tables: O(log n) operations, better for large datasets
// Dynamic fields: O(n) for iteration, better for small sets
```

## DeFi Development

### AMM Implementation

```move
public struct Pool<phantom X, phantom Y> has key {
    id: UID,
    reserve_x: Balance<X>,
    reserve_y: Balance<Y>,
    lp_supply: Supply<LP<X, Y>>,
    fee_percentage: u64,  // Basis points
}

public fun swap_x_to_y<X, Y>(
    pool: &mut Pool<X, Y>,
    coin_x: Coin<X>,
    min_out: u64,
    ctx: &mut TxContext
): Coin<Y> {
    let in_amount = coin::value(&coin_x);
    let (res_x, res_y) = get_reserves(pool);
    
    // Calculate output with fee
    let in_after_fee = in_amount * (10000 - pool.fee_percentage) / 10000;
    let out_amount = (res_y * in_after_fee) / (res_x + in_after_fee);
    
    assert!(out_amount >= min_out, E_SLIPPAGE);
    
    // Update reserves
    balance::join(&mut pool.reserve_x, coin::into_balance(coin_x));
    let out_balance = balance::split(&mut pool.reserve_y, out_amount);
    
    // Emit event
    event::emit(SwapEvent {
        pool: object::id(pool),
        amount_in: in_amount,
        amount_out: out_amount
    });
    
    coin::from_balance(out_balance, ctx)
}

// Concentrated liquidity for capital efficiency
public struct ConcentratedPosition has key, store {
    id: UID,
    lower_tick: u64,
    upper_tick: u64,
    liquidity: u128
}
```

### Lending Protocol

```move
public struct LendingPool<phantom T> has key {
    id: UID,
    // Deposits and borrows
    total_deposits: Balance<T>,
    total_borrows: u64,
    
    // Interest model
    base_rate: u64,
    multiplier: u64,
    
    // Risk parameters
    collateral_factor: u64,  // Basis points
    liquidation_threshold: u64,
    
    // User positions
    positions: Table<address, Position>
}

public struct Position has store {
    collateral: u64,
    borrowed: u64,
    last_update: u64
}

public fun borrow<T>(
    pool: &mut LendingPool<T>,
    amount: u64,
    collateral: Coin<T>,
    clock: &Clock,
    ctx: &mut TxContext
): Coin<T> {
    let sender = tx_context::sender(ctx);
    let position = get_or_create_position(pool, sender);
    
    // Update interest
    accrue_interest(pool, position, clock);
    
    // Check collateral ratio
    let collateral_value = coin::value(&collateral);
    position.collateral = position.collateral + collateral_value;
    position.borrowed = position.borrowed + amount;
    
    let max_borrow = (position.collateral * pool.collateral_factor) / 10000;
    assert!(position.borrowed <= max_borrow, E_UNDERCOLLATERALIZED);
    
    // Execute borrow
    balance::join(&mut pool.total_deposits, coin::into_balance(collateral));
    pool.total_borrows = pool.total_borrows + amount;
    
    let borrowed = balance::split(&mut pool.total_deposits, amount);
    coin::from_balance(borrowed, ctx)
}
```

### Flash Loans

```move
public struct FlashLoan<phantom T> {
    pool_id: ID,
    amount: u64,
    fee: u64
}

public fun flash_loan<T>(
    pool: &mut Pool<T>,
    amount: u64,
    ctx: &mut TxContext
): (Coin<T>, FlashLoan<T>) {
    // Calculate fee (0.09% = 9 basis points)
    let fee = (amount * 9) / 10000;
    
    let loan = FlashLoan<T> {
        pool_id: object::id(pool),
        amount,
        fee
    };
    
    // Check available liquidity
    assert!(balance::value(&pool.reserves) >= amount, E_INSUFFICIENT_LIQUIDITY);
    
    let coin = coin::from_balance(
        balance::split(&mut pool.reserves, amount),
        ctx
    );
    
    (coin, loan)
}

public fun repay_flash_loan<T>(
    pool: &mut Pool<T>,
    payment: Coin<T>,
    loan: FlashLoan<T>
) {
    let FlashLoan { pool_id, amount, fee } = loan;
    assert!(object::id(pool) == pool_id, E_WRONG_POOL);
    
    let repay_amount = amount + fee;
    assert!(coin::value(&payment) >= repay_amount, E_INSUFFICIENT_REPAYMENT);
    
    balance::join(&mut pool.reserves, coin::into_balance(payment));
    
    // Distribute fee to LP holders
    pool.collected_fees = pool.collected_fees + fee;
}
```

### Oracle Integration

```move
public struct PriceOracle has key {
    id: UID,
    feeds: Table<TypeName, PriceFeed>,
    admin: address
}

public struct PriceFeed has store {
    value: u64,
    decimal: u8,
    timestamp: u64,
    sources: vector<PriceSource>
}

public struct PriceSource has store {
    provider: address,
    value: u64,
    timestamp: u64
}

// Aggregated price with multiple sources
public fun get_price(
    oracle: &PriceOracle,
    type: TypeName,
    clock: &Clock
): (u64, u8) {
    let feed = table::borrow(&oracle.feeds, type);
    
    // Check staleness
    let current_time = clock::timestamp_ms(clock);
    assert!(current_time - feed.timestamp <= PRICE_STALE_THRESHOLD, E_STALE_PRICE);
    
    (feed.value, feed.decimal)
}

// TWAP implementation
public fun update_twap(
    oracle: &mut PriceOracle,
    type: TypeName,
    new_price: u64,
    clock: &Clock
) {
    let feed = table::borrow_mut(&mut oracle.feeds, type);
    let time_elapsed = clock::timestamp_ms(clock) - feed.timestamp;
    
    // Weighted average
    let weight = min(time_elapsed, TWAP_WINDOW);
    feed.value = ((feed.value * (TWAP_WINDOW - weight)) + 
                  (new_price * weight)) / TWAP_WINDOW;
    feed.timestamp = clock::timestamp_ms(clock);
}
```

## NFT and Digital Assets

### NFT Collection with Royalties

```move
public struct Collection has key {
    id: UID,
    name: String,
    symbol: String,
    creator: address,
    royalty_percentage: u64,  // Basis points
    minted: u64,
    max_supply: u64
}

public struct NFT has key, store {
    id: UID,
    collection_id: ID,
    name: String,
    description: String,
    url: Url,
    attributes: VecMap<String, String>
}

// Display standard for wallets/explorers
public struct DisplayTemplate has key, store {
    id: UID,
    fields: VecMap<String, String>
}

fun init(otw: MYNFT, ctx: &mut TxContext) {
    let publisher = package::claim(otw, ctx);
    
    // Set display template
    let display = display::new<NFT>(&publisher, ctx);
    display::add(&mut display, string::utf8(b"name"), string::utf8(b"{name}"));
    display::add(&mut display, string::utf8(b"image_url"), string::utf8(b"{url}"));
    display::update_version(&mut display);
    
    transfer::public_transfer(display, tx_context::sender(ctx));
    transfer::public_transfer(publisher, tx_context::sender(ctx));
}
```

### Kiosk Integration

```move
use sui::kiosk::{Self, Kiosk, KioskOwnerCap};
use sui::transfer_policy::{Self, TransferPolicy};

// Create kiosk for NFT trading
public fun create_kiosk(ctx: &mut TxContext): (Kiosk, KioskOwnerCap) {
    kiosk::new(ctx)
}

// List NFT in kiosk with custom logic
public fun list_nft(
    kiosk: &mut Kiosk,
    cap: &KioskOwnerCap,
    nft: NFT,
    price: u64
) {
    kiosk::place_and_list(kiosk, cap, nft, price);
}

// Custom transfer rules
public struct RoyaltyRule has drop {}

// Enforce royalties on transfer
public fun enforce_royalty<T>(
    policy: &mut TransferPolicy<T>,
    cap: &TransferPolicyCap<T>
) {
    let rule = RoyaltyRule {};
    transfer_policy::add_rule(
        rule,
        policy,
        cap,
        royalty_rule::fee_amount
    );
}

// Purchase with royalty payment
public fun purchase_from_kiosk<T: key + store>(
    kiosk: &mut Kiosk,
    nft_id: ID,
    payment: Coin<SUI>,
    ctx: &mut TxContext
): T {
    let (nft, transfer_request) = kiosk::purchase(kiosk, nft_id, payment);
    
    // Apply transfer policy (including royalties)
    let (paid, from) = transfer_policy::confirm_request(&policy, transfer_request);
    
    // Transfer royalty to creator
    transfer::public_transfer(paid, creator_address);
    
    nft
}
```

### Dynamic NFTs

```move
public struct EvolvingNFT has key, store {
    id: UID,
    level: u64,
    experience: u64,
    attributes: Table<String, u64>,
    last_interaction: u64
}

// NFT that changes based on interactions
public fun interact(
    nft: &mut EvolvingNFT,
    action: String,
    clock: &Clock
) {
    let current_time = clock::timestamp_ms(clock);
    
    // Time-based rewards
    let time_bonus = (current_time - nft.last_interaction) / 1000;
    nft.experience = nft.experience + 10 + time_bonus;
    
    // Level up logic
    if (nft.experience >= nft.level * 100) {
        nft.level = nft.level + 1;
        
        // Upgrade attributes
        let strength = table::borrow_mut(&mut nft.attributes, &string::utf8(b"strength"));
        *strength = *strength + 5;
    };
    
    nft.last_interaction = current_time;
    
    // Emit event for indexers
    event::emit(NFTInteraction {
        nft_id: object::id(nft),
        action,
        new_level: nft.level,
        timestamp: current_time
    });
}
```

### Composable NFTs

```move
public struct ComposableNFT has key {
    id: UID,
    base_image: Url,
    components: vector<Component>
}

public struct Component has store {
    slot: String,  // "hat", "weapon", etc.
    item_id: ID,
    boost: u64
}

// Equip component to NFT
public fun equip_component(
    nft: &mut ComposableNFT,
    component: Component
) {
    // Check slot compatibility
    let mut i = 0;
    let len = vector::length(&nft.components);
    while (i < len) {
        let existing = vector::borrow(&nft.components, i);
        assert!(existing.slot != component.slot, E_SLOT_OCCUPIED);
        i = i + 1;
    };
    
    vector::push_back(&mut nft.components, component);
}

// Calculate total stats
public fun calculate_power(nft: &ComposableNFT): u64 {
    let mut total = 100; // Base power
    let mut i = 0;
    let len = vector::length(&nft.components);
    
    while (i < len) {
        let component = vector::borrow(&nft.components, i);
        total = total + component.boost;
        i = i + 1;
    };
    
    total
}
```

## Development Tools and Workflow

### Sui CLI Commands

```bash
# Initialize new Move package
sui move new my_project

# Build package
sui move build

# Run tests
sui move test
sui move test --coverage  # With coverage report

# Publish package
sui client publish --gas-budget 100000000

# Call function
sui client call --package $PACKAGE_ID --module $MODULE --function $FUNCTION \
    --args $ARG1 $ARG2 --gas-budget 10000000

# Object inspection
sui client object $OBJECT_ID
sui client objects  # List owned objects

# Transaction debugging
sui client tx $TX_DIGEST
```

### Project Structure

```
my-project/
├── Move.toml
├── sources/
│   ├── main.move
│   ├── tokens/
│   │   ├── coin.move
│   │   └── nft.move
│   ├── defi/
│   │   ├── amm.move
│   │   └── lending.move
│   └── governance/
│       └── dao.move
├── tests/
│   ├── main_tests.move
│   └── integration_tests.move
├── scripts/
│   ├── deploy.sh
│   └── interact.ts
└── docs/
    └── README.md
```

### Move.toml Configuration

```toml
[package]
name = "MyProject"
version = "0.0.1"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "mainnet" }

[addresses]
my_project = "0x0"

[dev-dependencies]
# Test-only dependencies

[dev-addresses]
# Test addresses
my_project = "0xCAFE"
```

### VS Code Setup

```json
// .vscode/settings.json
{
    "move.server.path": "move-analyzer",
    "move.lint.enable": true,
    "move.hover.enable": true,
    "move.completion.enable": true,
    "move.format.enable": true,
    "editor.formatOnSave": true
}

// .vscode/tasks.json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "build",
            "type": "shell",
            "command": "sui move build",
            "group": {
                "kind": "build",
                "isDefault": true
            }
        },
        {
            "label": "test",
            "type": "shell",
            "command": "sui move test",
            "group": {
                "kind": "test",
                "isDefault": true
            }
        }
    ]
}
```

### Deployment Script

```typescript
// scripts/deploy.ts
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

async function deploy() {
    // Setup
    const keypair = Ed25519Keypair.deriveKeypair(process.env.MNEMONIC!);
    const client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io:443' });
    
    // Build and publish
    const { modules, dependencies } = await buildPackage();
    
    const tx = new TransactionBlock();
    const [upgradeCap] = tx.publish({
        modules,
        dependencies,
    });
    
    // Transfer upgrade capability
    tx.transferObjects([upgradeCap], keypair.getPublicKey().toSuiAddress());
    
    const result = await client.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: tx,
        options: {
            showEffects: true,
            showObjectChanges: true,
        },
    });
    
    console.log('Package ID:', result.effects?.created?.[0]?.reference);
}
```

### Indexing and Monitoring

```typescript
// Event indexer
import { SuiClient } from '@mysten/sui.js/client';

async function indexEvents() {
    const client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io:443' });
    
    // Subscribe to events
    const unsubscribe = await client.subscribeEvent({
        filter: {
            Package: PACKAGE_ID,
        },
        onMessage(event) {
            console.log('New event:', event);
            // Process and store event
            processEvent(event);
        },
    });
    
    // Query historical events
    const events = await client.queryEvents({
        query: {
            MoveModule: {
                package: PACKAGE_ID,
                module: 'amm',
            },
        },
        limit: 100,
    });
}
```

## Advanced Topics

### Clock and Time

```move
use sui::clock::{Self, Clock};

// Global clock at 0x6
public fun time_based_reward(
    user: &mut User,
    clock: &Clock
) {
    let current_time = clock::timestamp_ms(clock);
    let time_elapsed = current_time - user.last_claim;
    
    // Calculate rewards based on time
    let rewards = (time_elapsed / 1000) * REWARD_PER_SECOND;
    user.pending_rewards = user.pending_rewards + rewards;
    user.last_claim = current_time;
}

// Scheduled actions
public struct ScheduledAction has key {
    id: UID,
    execute_after: u64,
    action: vector<u8>
}

public fun execute_scheduled(
    action: ScheduledAction,
    clock: &Clock
) {
    let ScheduledAction { id, execute_after, action: action_data } = action;
    assert!(clock::timestamp_ms(clock) >= execute_after, E_TOO_EARLY);
    
    // Execute action
    object::delete(id);
}
```

### Randomness

```move
use sui::random::{Self, Random};

// Secure randomness with commit-reveal
public struct RandomnessRequest has key {
    id: UID,
    requester: address,
    commitment: vector<u8>,
    reveal_deadline: u64
}

// Step 1: Request randomness
public fun request_random(
    commitment: vector<u8>,
    clock: &Clock,
    ctx: &mut TxContext
) {
    let request = RandomnessRequest {
        id: object::new(ctx),
        requester: tx_context::sender(ctx),
        commitment,
        reveal_deadline: clock::timestamp_ms(clock) + REVEAL_WINDOW
    };
    transfer::share_object(request);
}

// Step 2: Reveal and use randomness
public fun reveal_and_use(
    request: RandomnessRequest,
    reveal: vector<u8>,
    random: &Random,
    ctx: &mut TxContext
) {
    let RandomnessRequest { id, requester, commitment, reveal_deadline: _ } = request;
    
    // Verify commitment
    assert!(hash::sha3_256(reveal) == commitment, E_INVALID_REVEAL);
    
    // Generate random number
    let mut generator = random::new_generator(random, ctx);
    let random_number = random::generate_u64(&mut generator);
    
    object::delete(id);
    
    // Use random number for game logic
}
```

### Package Upgrades

```move
// Versioned modules
module package_v2::upgraded_module {
    use package_v1::original_module;
    
    // Migration function
    public fun migrate_data(
        old_data: original_module::OldStruct,
        ctx: &mut TxContext
    ): NewStruct {
        let original_module::OldStruct { field1, field2 } = old_data;
        
        NewStruct {
            id: object::new(ctx),
            field1,
            field2,
            new_field: DEFAULT_VALUE  // New field
        }
    }
    
    // Maintain compatibility
    public fun process_with_version(data: &mut NewStruct, version: u64) {
        if (version == 1) {
            // Legacy behavior
        } else {
            // New behavior
        }
    }
}
```

### Custom Transfer Policies

```move
use sui::transfer_policy::{
    Self, TransferPolicy, TransferPolicyCap,
    TransferRequest
};

// Time-locked transfers
public struct TimeLockRule has drop {}

public fun add_timelock_rule<T>(
    policy: &mut TransferPolicy<T>,
    cap: &TransferPolicyCap<T>,
    lock_duration: u64
) {
    transfer_policy::add_rule(
        TimeLockRule {},
        policy,
        cap,
        |_| lock_duration  // Config
    );
}

// Verify time lock
public fun verify_timelock<T>(
    request: &mut TransferRequest<T>,
    clock: &Clock
) {
    let creation_time = transfer_policy::created(request);
    let lock_duration = transfer_policy::get_rule_config<TimeLockRule, u64>(
        &policy,
        TimeLockRule {}
    );
    
    assert!(
        clock::timestamp_ms(clock) >= creation_time + lock_duration,
        E_STILL_LOCKED
    );
    
    transfer_policy::add_receipt(TimeLockRule {}, request);
}
```

### Advanced Event Patterns

```move
// Structured events for indexing
public struct EventV1 has copy, drop {
    version: u8,
    action: String,
    actor: address,
    data: vector<u8>  // Serialized data
}

// Event aggregation
public struct EventAggregator has key {
    id: UID,
    events: vector<EventV1>,
    max_size: u64
}

public fun log_event(
    aggregator: &mut EventAggregator,
    action: String,
    data: vector<u8>,
    ctx: &TxContext
) {
    let event = EventV1 {
        version: 1,
        action,
        actor: tx_context::sender(ctx),
        data
    };
    
    // Emit immediately
    event::emit(event);
    
    // Also store for batch processing
    vector::push_back(&mut aggregator.events, event);
    
    // Flush if full
    if (vector::length(&aggregator.events) >= aggregator.max_size) {
        flush_events(aggregator);
    }
}
```

## Common Pitfalls and Solutions

### 1. Object Ownership Confusion

```move
// WRONG: Trying to modify owned object in shared context
public fun wrong_update(user_nft: &mut NFT) {
    // This won't work if NFT is owned
    user_nft.level = user_nft.level + 1;
}

// CORRECT: Transfer ownership or use shared object
public fun correct_update_owned(
    user_nft: NFT,
    ctx: &mut TxContext
): NFT {
    let mut nft = user_nft;
    nft.level = nft.level + 1;
    nft  // Return updated NFT
}

// OR use shared object pattern
public struct SharedNFTRegistry has key {
    id: UID,
    nfts: Table<ID, NFTData>
}
```

### 2. Dynamic Field Misuse

```move
// WRONG: Exposing UID directly
public fun get_uid_wrong(obj: &MyObject): &mut UID {
    &mut obj.id  // NEVER DO THIS
}

// CORRECT: Use specific functions
public fun add_field_correct<T: store>(
    obj: &mut MyObject,
    key: String,
    value: T
) {
    dynamic_field::add(&mut obj.id, key, value);
}
```

### 3. Clock Access Patterns

```move
// WRONG: Storing Clock
public struct WrongStruct has key {
    id: UID,
    clock: Clock  // Clock can't be stored
}

// CORRECT: Pass Clock as reference
public fun correct_time_check(
    data: &mut TimedData,
    clock: &Clock
) {
    let current = clock::timestamp_ms(clock);
    if (current > data.expiry) {
        data.is_expired = true;
    }
}
```

### 4. Test Scenario Mistakes

```move
// WRONG: Not advancing transactions
#[test]
fun wrong_test() {
    let scenario = test_scenario::begin(@0x1);
    create_object(test_scenario::ctx(&mut scenario));
    let obj = test_scenario::take_from_sender<Object>(&scenario); // FAILS
}

// CORRECT: Advance transaction
#[test]
fun correct_test() {
    let mut scenario = test_scenario::begin(@0x1);
    
    test_scenario::next_tx(&mut scenario, @0x1);
    {
        create_object(test_scenario::ctx(&mut scenario));
    };
    
    test_scenario::next_tx(&mut scenario, @0x1);
    {
        let obj = test_scenario::take_from_sender<Object>(&scenario);
        test_scenario::return_to_sender(&scenario, obj);
    };
    
    test_scenario::end(scenario);
}
```

### 5. Gas Optimization Mistakes

```move
// WRONG: Multiple transactions for related operations
// Transaction 1: Create NFT
// Transaction 2: Set attributes
// Transaction 3: Transfer

// CORRECT: Use PTB
public fun create_and_setup_nft(
    name: String,
    attributes: vector<String>,
    recipient: address,
    ctx: &mut TxContext
) {
    let mut nft = create_nft(name, ctx);
    set_attributes(&mut nft, attributes);
    transfer::transfer(nft, recipient);
    // All in one transaction!
}
```

## Production Checklist

### Before Mainnet Deployment

- [ ] **Security Audit**
  - [ ] Internal review complete
  - [ ] External audit scheduled
  - [ ] Automated scanning passed

- [ ] **Testing**
  - [ ] 100% critical path coverage
  - [ ] Integration tests with real scenarios
  - [ ] Load testing completed
  - [ ] Testnet deployment validated

- [ ] **Documentation**
  - [ ] API documentation complete
  - [ ] Integration guide written
  - [ ] Security considerations documented

- [ ] **Monitoring**
  - [ ] Event indexer deployed
  - [ ] Monitoring dashboard ready
  - [ ] Alert system configured

- [ ] **Emergency Procedures**
  - [ ] Pause mechanism tested
  - [ ] Upgrade path validated
  - [ ] Incident response plan

### Code Review Checklist

```move
// Check these in every code review:

// 1. Input validation
assert!(amount > 0, E_INVALID_AMOUNT);
assert!(vector::length(&items) <= MAX_ITEMS, E_TOO_MANY);

// 2. Access control
assert!(ctx.sender() == admin, E_UNAUTHORIZED);

// 3. Integer overflow protection
let total = safe_add(balance, amount);

// 4. Proper error codes
const E_INSUFFICIENT_FUNDS: u64 = 1;
const E_UNAUTHORIZED: u64 = 2;

// 5. Event emission
event::emit(ActionComplete { user, amount, timestamp });

// 6. No sensitive data in events/storage
// DON'T: store private keys, passwords
// DO: store hashes, public keys

// 7. Consistent naming
// good_function_name, GoodStructName, GOOD_CONSTANT

// 8. Comments for complex logic
// Explain WHY, not WHAT
```

## Conclusion

Becoming an exceptional Sui Move developer requires:

1. **Deep Understanding**: Master Sui's object model and Move's type system
2. **Security First**: Always consider attack vectors and edge cases
3. **Performance Awareness**: Optimize for gas and user experience
4. **Best Practices**: Follow established patterns and conventions
5. **Continuous Learning**: Stay updated with Sui's rapid development
6. **Community Engagement**: Contribute to and learn from the ecosystem

Remember: The best Sui Move developers don't just write code that works—they write code that's secure, efficient, maintainable, and leverages Sui's unique capabilities to create innovative solutions.

Keep building, keep learning, and welcome to the future of blockchain development on Sui!