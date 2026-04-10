document.addEventListener('DOMContentLoaded', async () => {
    const pokemonSprite = document.getElementById('pokemonSprite');
    const pokemonName = document.getElementById('pokemonName');
    const pokemonId = document.getElementById('pokemonId');
    const pokemonTypes = document.getElementById('pokemonTypes');
    const statsContainer = document.getElementById('statsContainer');
    const abilitiesContainer = document.getElementById('abilitiesContainer');
    const evolutionButton = document.getElementById('evolutionButton');
    const evolutionChain = document.getElementById('evolutionChain');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');

    let currentId = new URLSearchParams(window.location.search).get('id');

    async function loadPokemon(id) {
        const pokemon = await PokeAPI.getPokemonDetailById(id);
        
        if (!pokemon) {
            document.body.innerHTML = '<h1>Pokemon not found</h1>';
            return;
        }

        pokemonTypes.innerHTML = '';
        statsContainer.innerHTML = '';
        abilitiesContainer.innerHTML = '';
        evolutionChain.innerHTML = '';
        evolutionChain.style.display = 'none';

        // display info
        pokemonSprite.src = PokeAPI.constructSpriteUrl(pokemon.id);
        pokemonSprite.alt = pokemon.name;
        pokemonName.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        pokemonId.textContent = `#${pokemon.id}`;

        // display types
        pokemon.types.forEach(typeObj => {
            const typeDiv = document.createElement('div');
            typeDiv.className = 'type-badge';
            typeDiv.textContent = typeObj.type.name.toUpperCase();
            pokemonTypes.appendChild(typeDiv);
        });

        // Display stats with bars
        pokemon.stats.forEach(statObj => {
            const statDiv = document.createElement('div');
            statDiv.className = 'stat-row';
            statDiv.innerHTML = `
                <span class="stat-name">${statObj.stat.name}</span>
                <div class="stat-bar">
                    <div class="stat-fill" style="width: ${(statObj.base_stat / 150) * 100}%"></div>
                </div>
                <span class="stat-value">${statObj.base_stat}</span>
            `;
            statsContainer.appendChild(statDiv);
        });

        // Display abilities
        pokemon.abilities.forEach(abilityObj => {
            const abilityDiv = document.createElement('div');
            abilityDiv.className = 'ability-item';
            const isHidden = abilityObj.is_hidden ? ' (Hidden)' : '';
            abilityDiv.textContent = abilityObj.ability.name.charAt(0).toUpperCase() + abilityObj.ability.name.slice(1) + isHidden;
            abilitiesContainer.appendChild(abilityDiv);
        });

        currentId = pokemon.id;
        prevButton.disabled = pokemon.id <= 1;
        nextButton.disabled = pokemon.id >= 1025;
        
        window.history.replaceState({}, '', `?id=${pokemon.id}`);
    }

    loadPokemon(currentId);

    prevButton.addEventListener('click', () => {
        loadPokemon(currentId - 1);
    });
    nextButton.addEventListener('click', () => {
        loadPokemon(currentId + 1);
    });

    // Evolution chain
    evolutionButton.addEventListener('click', async () => {
        if (evolutionChain.style.display === 'none') {
            evolutionChain.style.display = 'block';
            
            if (evolutionChain.children.length === 0) {
                evolutionChain.innerHTML = '<p>Loading evolution chain...</p>';
                
                const chain = await PokeAPI.getEvolutionChain(currentId);
                
                if (chain) {
                    displayEvolutionChain(chain);
                } else {
                    evolutionChain.innerHTML = '<p>Could not load evolution chain</p>';
                }
            }
        } else {
            evolutionChain.style.display = 'none';
        }
    });

    function displayEvolutionChain(chain) {
        evolutionChain.innerHTML = '';
        let html = '<div class="evolution-container">';
        
        function addEvolution(evoData) {
            html += `<div class="evolution-item">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evoData.species.url.split('/')[6]}.png" alt="${evoData.species.name}">
                <p>${evoData.species.name.charAt(0).toUpperCase() + evoData.species.name.slice(1)}</p>`;
            
            if (evoData.evolves_to.length > 0) {
                html += '<p>→</p>';
                evoData.evolves_to.forEach(nextEvo => {
                    addEvolution(nextEvo);
                });
            }
            html += '</div>';
        }
        
        addEvolution(chain);
        html += '</div>';
        evolutionChain.innerHTML = html;
    }
});