package hectoc

import (
	"math/rand"
	"strconv"
	"time"
)

const MAX_ATTEMPTS = 100

type Hectoc struct {
	Problem 	string 		`json:"problem"`
	Solutions 	[]string 	`json:"solutions"`
}

var insertions = []string{"+", "-", "*", "/", "^", "(", ")", ""}

func generateSolutions(current string, remaining string, solutions *[]string, bracesParity int) {
	if len(remaining) == 0 {
		// Check if the current expression is valid
		if bracesParity > 0 {
			return
		} else {
			for i := 1; i <= bracesParity; i++ {
				current += ")"
			}
		}

		verified, _ := Verify(current)

		if verified {
			*solutions = append(*solutions, current)
		}

		return
	}

	nextDigit := remaining[0]
	newRemaining := remaining[1:]

	for _, insertion := range insertions {
		if insertion == "(" {
			bracesParity--
		} else if insertion == ")" {
			bracesParity++
		}

		newCurrent := current + insertion + string(nextDigit)

		generateSolutions(newCurrent, newRemaining, solutions, bracesParity)
	}
}

func (h *Hectoc) solve() {
	var solutions []string

	// Generate all possible solutions
	generateSolutions("", h.Problem, &solutions, 0)
	h.Solutions = solutions
}

var fallbacks = []string{"123456", "999541", "472319", "327924"}

func Generate() *Hectoc {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))

	for attempts:=1; attempts <= 100; attempts++ {
		sequence := ""

		for i:=1; i<=6; i++ {
			digit := r.Intn(9) + 1
			sequence += strconv.Itoa(digit)
		}

		if _, found := excluded[sequence]; !found {
			h := &Hectoc{
				Problem: sequence,
			}

			h.solve()

			return h
		}
	}

	sequence := fallbacks[r.Intn(len(fallbacks))]

	h := &Hectoc{
		Problem: sequence,
	}

	h.solve()

	return h

}