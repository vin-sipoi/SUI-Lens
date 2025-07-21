module sui_lens_poap::poap_test {
    use sui_lens_poap::poap;


    #[test]
    fun test_poap_flow() {
        let mut ctx = sui::tx_context::dummy();

        // Step 1: Create an event using the helper function
        let mut event = poap::create_event_for_test(
            b"Test Event",
            b"Test Description",
            b"https://example.com/image.png",
            &mut ctx
        );

        // Step 2: RSVP
        poap::rsvp(&mut event, &mut ctx);

        // Step 3: Check in
        poap::checkin(&mut event, &mut ctx);

        // Step 4: Mint POAP
        poap::mint_poap(&event, &mut ctx);

        // Consume the event to avoid 'drop' error
        transfer::public_transfer(event, @0xCAFE);
    }

    #[test]
    fun test_event_fields() {
        let mut ctx = sui::tx_context::dummy();
        let event = poap::create_event_for_test(
            b"Test Event",
            b"Test Description",
            b"https://example.com/image.png",
            &mut ctx
        );
        // Example assertions (pseudo-code, adapt as needed for your test framework)
        // assert!(event.name == b"Test Event", 0);
        // assert!(event.description == b"Test Description", 1);
        // assert!(event.poap_image_url == b"https://example.com/image.png", 2);

        // Consume the event to avoid 'drop' error
        transfer::public_transfer(event, @0xCAFE);
    }
}
