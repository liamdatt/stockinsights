
const tick = 'TEST_TICKER';
const payload = {
    [tick]: {
        '2023-10-25': {
            "1_day_change_pct": null,
            "30_day_change_pct": null,
            "relative_volume": null,
            "data": {
                "Volume": "1,000",
                "Last Traded Price ($)": "10.00",
                "Closing Price ($)": "10.00",
                "Price Change ($)": "0.00",
                "Closing Bid ($)": "9.90",
                "Closing Ask ($)": "10.10"
            }
        },
        '2023-10-26': {
            "1_day_change_pct": 10.0,
            "30_day_change_pct": null,
            "relative_volume": 2.0,
            "data": {
                "Volume": "2,000",
                "Last Traded Price ($)": "11.00",
                "Closing Price ($)": "11.00",
                "Price Change ($)": "1.00",
                "Closing Bid ($)": "10.90",
                "Closing Ask ($)": "11.10"
            }
        }
    }
};

async function run() {
    console.log('Sending payload...');
    // Native fetch node 18+
    const res = await fetch('http://localhost:3000/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
}

run();
