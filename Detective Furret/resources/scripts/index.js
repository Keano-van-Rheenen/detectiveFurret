document.addEventListener('DOMContentLoaded', async () => {
    const table = document.querySelector('.pokemon-list table');
    const trigger = document.querySelector('.list-trigger');
    const searchButton = document.querySelector('#searchButton');
    const nameInput = document.querySelector('#nameSearch');
    const genInput = document.querySelector('#generationSearch');
    const autocompleteBox = document.querySelector('#autocompleteBox');

    const observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting) {
            const list = await PokeAPI.getPokemonBatch();
            if (!list || list.length === 0) return;
            
            if (PokeAPI.genEnd) {
                const lastId = parseInt(list[list.length - 1].url.split('/').filter(x => x).pop());
                if (lastId > PokeAPI.genEnd) {
                    observer.disconnect();
                    return;
                }
            }
            
            renderPokemon(list);
        }
    }, { rootMargin: "200px" });
    observer.observe(trigger);

    let generationRanges = {};
    const genRes = await fetch('../../public/Saved/generationRanges.json');
    generationRanges = await genRes.json();

    let autocompleteNames = [];
    const res = await fetch('../../public/Saved/pokemonNames.json');
    autocompleteNames = await res.json();

    
    searchButton.addEventListener('click', async () => {
        let raw = genInput.value || nameInput.value;
        if (!raw) return;

        raw = raw.trim();

        observer.disconnect();

        const rows = table.querySelectorAll('tr');
        rows.forEach((row, index) => {
            if (index > 0) row.remove();
        });

        // gen search
        const isNumeric = /^[0-9]+$/.test(raw);
        if (isNumeric && generationRanges[raw]) {
            const { start, end } = generationRanges[raw];

            PokeAPI.reset();
            PokeAPI.offset = start - 1;
            PokeAPI.limit = 20;
            PokeAPI.genEnd = end;

            const list = await PokeAPI.getPokemonBatch();
            renderPokemon(list);

            observer.observe(trigger);
            return;
        }

        // name search
        const value = raw.toLowerCase();
        try {
            const data = await PokeAPI.getPokemonDetailById(value);
            if (!data) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="2">Not found</td>`;
                table.appendChild(row);
                return;
            }
            const fakeList = [{
                name: data.name,
                url: `${PokeAPI.baseURL}/pokemon/${data.id}`
            }];
            renderPokemon(fakeList);
        } catch (err) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="2">Not found</td>`;
            table.appendChild(row);
        }
    });

    // autocomplete
    nameInput.addEventListener('input', () => {
        const value = nameInput.value.trim().toLowerCase();
        if (value === "") {
            autocompleteBox.innerHTML = "";
            return;
        }
        const matches = autocompleteNames
            .filter(name => name.startsWith(value))
            .slice(0, 10);
        autocompleteBox.innerHTML = matches
            .map(name => `<div class="suggestion">${name}</div>`)
            .join('');
    });

    autocompleteBox.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion')) {
            nameInput.value = e.target.textContent;
            autocompleteBox.innerHTML = "";
        }
    });

    // render
    function renderPokemon(list) {
        if (!list) return;
        
        list.forEach((pokemon) => {
            const id = pokemon.url.substring(pokemon.url.indexOf("pokemon")).split('/')[1];
            const name = pokemon.name;
            const sprite = PokeAPI.constructSpriteUrl(id);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${sprite}" alt="${name}">${id}</td>
                <td>${name}</td>
            `;
            row.addEventListener('click', async () => {
                window.location.href = `PokemonDetail.html?id=${id}`;
            });
            table.appendChild(row);
        });
    }
});
