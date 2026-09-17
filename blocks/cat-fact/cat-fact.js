export default async function decorate(block) {

    const response = await fetch('https://catfact.ninja/fact');
    const data = await response.json();
    block.textContent = data.fact;

}