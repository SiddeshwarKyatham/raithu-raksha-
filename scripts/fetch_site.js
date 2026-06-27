async function main() {
  try {
    const url = 'https://rythuraksha.org/assets/index-B6dxmRaI.js';
    const res = await fetch(url);
    const text = await res.text();
    const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    console.log("All emails in bundle:", [...new Set(emails)]);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
