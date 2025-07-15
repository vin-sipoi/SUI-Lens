#[test_only]
#[allow(duplicate_alias, unused_use)]
module suilens_contracts::basic_test {
    #[test]
    fun test_basic_arithmetic() {
        assert!(1 + 1 == 2, 0);
        assert!(5 * 2 == 10, 1);
    }

    #[test]
    #[expected_failure(abort_code = 42, location = Self)]
    fun test_expected_failure() {
        abort 42
    }
}