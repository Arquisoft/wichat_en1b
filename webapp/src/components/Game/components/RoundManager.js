class RoundManager {
    constructor(totalRounds = 10) {
        this.totalRounds = totalRounds;
        this.currentRound = 1;
    }

    nextRound() {
        this.currentRound += 1;
    }

    hasNextRound() {
        if (this.totalRounds === Infinity) return true;
        return this.currentRound < this.totalRounds;
    }

    resetRounds() {
        this.currentRound = 1;
    }

    getCurrentRound() {
        return this.currentRound;
    }
}

export default RoundManager;
