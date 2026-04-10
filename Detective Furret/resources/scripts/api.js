const PokeAPI = {
    baseURL: 'https://pokeapi.co/api/v2',
    limit: 20,
    offset: 0,

    constructSpriteUrl(id) {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    },

    async getPokemonDetailById(id) {
        const url = `${this.baseURL}/pokemon/${id}`;
        const response = await fetch(url);
        const data = response.ok ? await response.json() : null;
        return data;
    },

    async getPokemonBatch() {
        const response = await fetch(`${this.baseURL}/pokemon?limit=${this.limit}&offset=${this.offset}`);
        const data = response.ok ? await response.json() : null;
        this.offset += this.limit;
        return data.results;
    },

    async getPokemonByType(typeName) {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.pokemon.map(p => p.pokemon);
    },

    async getEvolutionChain(id) {
        try {
            const speciesUrl = `${this.baseURL}/pokemon-species/${id}`;
            const speciesRes = await fetch(speciesUrl);
            if (!speciesRes.ok) return null;
            const species = await speciesRes.json();
            
            const chainRes = await fetch(species.evolution_chain.url);
            if (!chainRes.ok) return null;
            const chainData = await chainRes.json();
            
            return chainData.chain;
        } catch (err) {
            return null;
        }
    },

    reset() {
        this.offset = 0;
    }
};