package hectoc

const answer = 100.0

func Verify(expression string) (bool, error) {
	calculator := newCalculator()

	result, err := calculator.calculate(expression)

	if err != nil {
		return false, err
	}

	if result != answer {
		return false, nil
	}

	return true, nil
} 