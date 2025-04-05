package rating

import (
	"math"
)

// K-factor determines how much ratings change after each game
const KFactor = 32

// UpdateRatings calculates new ELO ratings after a game between two players
// Parameters:
// - winnerId: ID of the winning player (if 0, the game was a draw)
// - player1Id: ID of the first player
// - player1Rating: current rating of the first player
// - player2Id: ID of the second player
// - player2Rating: current rating of the second player
// Returns:
// - new rating for player1
// - new rating for player2
func GetNewRatings(player1Id, player2Id, winnerId int64, player1Rating, player2Rating int) (int, int) {
	// Determine the outcome of the match
	var outcome float64
	if winnerId == player1Id {
		// Player 1 wins
		outcome = 1.0
	} else {
		// Player 2 wins (assume it's player2Id)
		outcome = 0.0
	}

	// Calculate expected outcome based on current ratings
	expected1 := expectedOutcome(player1Rating, player2Rating)

	// Calculate rating changes
	delta1 := int(math.Round(KFactor * (outcome - expected1)))
	delta2 := int(math.Round(KFactor * ((1 - outcome) - (1 - expected1))))

	// Apply changes
	newRating1 := player1Rating + delta1
	newRating2 := player2Rating + delta2

	// Ensure ratings don't go below 100
	if newRating1 < 0 {
		newRating1 = 0
	}
	if newRating2 < 0 {
		newRating2 = 0
	}

	return newRating1, newRating2
}

// expectedOutcome calculates the expected outcome probability
// based on the ELO formula
func expectedOutcome(rating1, rating2 int) float64 {
	return 1.0 / (1.0 + math.Pow(10, float64(rating2-rating1)/400.0))
}

// GetDefaultRating returns the default rating for new players
func GetDefaultRating() int {
	return 400
}

