
const date = '2023-10-26';

async function run() {
    console.log(`Generating report for ${date}...`);
    const generateRes = await fetch(`http://localhost:3000/api/reports/${date}`, {
        method: 'POST'
    });
    console.log('POST Status:', generateRes.status);
    console.log('POST Response:', await generateRes.text());

    console.log(`Fetching existing report URL for ${date}...`);
    const fetchRes = await fetch(`http://localhost:3000/api/reports/${date}`);
    console.log('GET Status:', fetchRes.status);
    console.log('GET Response:', await fetchRes.text());
}

run();
