#![cfg(test)]

use crate::{AutoShareContract, AutoShareContractClient};
use soroban_sdk::{
    symbol_short,
    testutils::{Address as _, Events},
    vec, Address, BytesN, Env, IntoVal,
};

fn make_env() -> (Env, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(AutoShareContract, ());
    let client = AutoShareContractClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    client.initialize_admin(&admin);
    (env, contract_id)
}

// ── Happy path ────────────────────────────────────────────────────────────────

#[test]
fn test_batch_emits_event_once() {
    let (env, contract_id) = make_env();
    let client = AutoShareContractClient::new(&env, &contract_id);

    let batch_id = BytesN::from_array(&env, &[1u8; 32]);
    client.process_notification_batch(&batch_id, &5u32);

    let events = env.events().all();
    assert_eq!(events.len(), 1);

    assert_eq!(
        events,
        vec![
            &env,
            (
                contract_id.clone(),
                (symbol_short!("batch_done"), batch_id.clone()).into_val(&env),
                5u32.into_val(&env),
            ),
        ]
    );
}

#[test]
fn test_batch_notification_count_matches() {
    let (env, contract_id) = make_env();
    let client = AutoShareContractClient::new(&env, &contract_id);

    let batch_id = BytesN::from_array(&env, &[2u8; 32]);
    client.process_notification_batch(&batch_id, &42u32);

    let (_contract, _topics, data) = env.events().all().get(0).unwrap();
    let count: u32 = data.into_val(&env);
    assert_eq!(count, 42u32);
}

#[test]
fn test_batch_id_in_topic() {
    let (env, contract_id) = make_env();
    let client = AutoShareContractClient::new(&env, &contract_id);

    let batch_id = BytesN::from_array(&env, &[7u8; 32]);
    client.process_notification_batch(&batch_id, &10u32);

    let (emitting_contract, _topics, _data) = env.events().all().get(0).unwrap();
    assert_eq!(emitting_contract, contract_id);
}

#[test]
fn test_two_batches_emit_independently() {
    let (env, contract_id) = make_env();
    let client = AutoShareContractClient::new(&env, &contract_id);

    client.process_notification_batch(&BytesN::from_array(&env, &[0xAAu8; 32]), &3u32);
    client.process_notification_batch(&BytesN::from_array(&env, &[0xBBu8; 32]), &7u32);

    assert_eq!(env.events().all().len(), 2);
}

// ── Guards ────────────────────────────────────────────────────────────────────

#[test]
#[should_panic]
fn test_batch_fails_when_paused() {
    let (env, contract_id) = make_env();
    let client = AutoShareContractClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    client.pause(&admin);

    client.process_notification_batch(&BytesN::from_array(&env, &[1u8; 32]), &5u32);
}

#[test]
#[should_panic]
fn test_batch_fails_with_zero_count() {
    let (env, contract_id) = make_env();
    let client = AutoShareContractClient::new(&env, &contract_id);
    client.process_notification_batch(&BytesN::from_array(&env, &[1u8; 32]), &0u32);
}
