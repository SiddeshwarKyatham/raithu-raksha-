async function main() {
  try {
    const res = await fetch('http://127.0.0.1:5173/api/farmers');
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Returned count:", data.length);
    console.log("First farmer:", JSON.stringify(data[0], null, 2));
  } catch (error) {
    console.error("Fetch API error:", error);
  }
}

main();
