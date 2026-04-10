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
