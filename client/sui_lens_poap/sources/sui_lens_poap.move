module sui_lens_poap::poap {
    use sui::object::{ new};
    use sui::tx_context::sender;
    use sui::table;

    public struct Event has key, store {
        id: UID,
        organizer: address,
        name: vector<u8>,
        description: vector<u8>,
        poap_image_url: vector<u8>,
        rsvp_table: table::Table<address, bool>,
        checkin_table: table::Table<address, bool>,
    }

    public struct POAP has key, store {
        id: UID,
        event_id: address,
        owner: address,
        claimed_at: u64,
    }

    /// Create a new event and transfer it to the organizer
    public entry fun create_event(
        name: vector<u8>,
        description: vector<u8>,
        poap_image_url: vector<u8>,
        ctx: &mut sui::tx_context::TxContext
    ) {
        let id = new(ctx);
        let rsvp_table = table::new(ctx);
        let checkin_table = table::new(ctx);
        let event = Event {
            id,
            organizer: sender(ctx),
            name,
            description,
            poap_image_url,
            rsvp_table,
            checkin_table,
        };
        sui::transfer::public_transfer(event, sender(ctx));
    }

    public entry fun rsvp(event: &mut Event, ctx: &mut sui::tx_context::TxContext) {
        let user = sender(ctx);
        table::add(&mut event.rsvp_table, user, true);
    }

    public entry fun checkin(event: &mut Event, ctx: &mut sui::tx_context::TxContext) {
        let user = sender(ctx);
        assert!(table::contains(&event.rsvp_table, user), 0);
        table::add(&mut event.checkin_table, user, true);
    }

    /// Mint POAP (must have checked in)
    public entry fun mint_poap(event: &Event, ctx: &mut sui::tx_context::TxContext) {
        let user = sender(ctx);
        assert!(table::contains(&event.checkin_table, user), 1);
        let id = new(ctx);
        let poap = POAP {
            id,
            event_id: event.organizer,
            owner: user,
            claimed_at: 0,
        };
        sui::transfer::public_transfer(poap, user);
    }
    public fun create_event_for_test(
    name: vector<u8>,
    description: vector<u8>,
    poap_image_url: vector<u8>,
    ctx: &mut sui::tx_context::TxContext
): Event {
    let id = new(ctx);
    let rsvp_table = table::new(ctx);
    let checkin_table = table::new(ctx);
    Event {
        id,
        organizer: sender(ctx),
        name,
        description,
        poap_image_url,
        rsvp_table,
        checkin_table,
    }
}

}
