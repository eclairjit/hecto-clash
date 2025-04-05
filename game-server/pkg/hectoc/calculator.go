package hectoc

import (
	"errors"
	"fmt"
	"math"
	"strconv"
	"strings"
	"unicode"
)

// Token types
const (
	NUMBER = iota
	OPERATOR
	LEFT_PAREN
	RIGHT_PAREN
)

// Operators
const (
	ADD      = "+"
	SUBTRACT = "-"
	MULTIPLY = "*"
	DIVIDE   = "/"
	POWER    = "^"
)

// Operator precedence
var precedence = map[string]int{
	ADD:      1,
	SUBTRACT: 1,
	MULTIPLY: 2,
	DIVIDE:   2,
	POWER:    3,
}

// Token represents a token in the expression
type Token struct {
	Type  int
	Value string
}

// isOperator checks if a string is a valid operator
func isOperator(s string) bool {
	return s == ADD || s == SUBTRACT || s == MULTIPLY || s == DIVIDE || s == POWER
}

// calculator handles the parsing and evaluation of mathematical expressions
type calculator struct {
	Tokens []Token
}

// Newcalculator creates a new calculator instance
func newCalculator() *calculator {
	return &calculator{}
}

// tokenize converts an expression string into tokens
func (c *calculator) tokenize(expression string) error {
	c.Tokens = []Token{}
	
	// Instead of removing all spaces, trim leading/trailing spaces
	expression = strings.TrimSpace(expression)
	
	if len(expression) == 0 {
		return errors.New("empty expression")
	}

	i := 0
	for i < len(expression) {
		char := expression[i]

		// Skip spaces between tokens
		if unicode.IsSpace(rune(char)) {
			i++
			continue
		}

		// Handle numbers (including decimals)
		if unicode.IsDigit(rune(char)) || char == '.' {
			j := i
			hasDot := char == '.'
			
			// Find the end of the number
			for j+1 < len(expression) && (unicode.IsDigit(rune(expression[j+1])) || (!hasDot && expression[j+1] == '.')) {
				j++
				if expression[j] == '.' {
					hasDot = true
				}
			}
			
			c.Tokens = append(c.Tokens, Token{NUMBER, expression[i:j+1]})
			i = j + 1
			continue
		}

		// Handle parentheses
		if char == '(' {
			c.Tokens = append(c.Tokens, Token{LEFT_PAREN, "("})
			i++
			continue
		}
		
		if char == ')' {
			c.Tokens = append(c.Tokens, Token{RIGHT_PAREN, ")"})
			i++
			continue
		}

		// Handle operators
		if isOperator(string(char)) {
			// Check for unary minus/plus
			if (char == '-' || char == '+') && (i == 0 || expression[i-1] == '(' || isOperator(string(expression[i-1])) || unicode.IsSpace(rune(expression[i-1])) && (len(c.Tokens) == 0 || c.Tokens[len(c.Tokens)-1].Type == LEFT_PAREN || c.Tokens[len(c.Tokens)-1].Type == OPERATOR)) {
				if char == '-' {
					// Handle unary minus by treating it as -1 *
					c.Tokens = append(c.Tokens, Token{NUMBER, "-1"})
					c.Tokens = append(c.Tokens, Token{OPERATOR, "*"})
				}
				// Ignore unary plus
				i++
				continue
			}
			
			c.Tokens = append(c.Tokens, Token{OPERATOR, string(char)})
			i++
			continue
		}

		// Invalid character
		return fmt.Errorf("invalid character in expression: %c", char)
	}

	return c.validateTokens()
}

// validateTokens checks if the token sequence is valid
func (c *calculator) validateTokens() error {
	if len(c.Tokens) == 0 {
		return errors.New("no tokens in expression")
	}

	// Check for adjacent numbers which would indicate missing operator
	for i := 0; i < len(c.Tokens)-1; i++ {
		if c.Tokens[i].Type == NUMBER && c.Tokens[i+1].Type == NUMBER {
			return fmt.Errorf("missing operator between numbers: %s and %s", c.Tokens[i].Value, c.Tokens[i+1].Value)
		}
	}

	// Check first and last tokens
	if c.Tokens[0].Type == OPERATOR && c.Tokens[0].Value != "-" && c.Tokens[0].Value != "+" {
		return errors.New("expression cannot start with a binary operator")
	}
	
	if c.Tokens[len(c.Tokens)-1].Type == OPERATOR {
		return errors.New("expression cannot end with an operator")
	}

	// Check for balanced parentheses
	parenBalance := 0
	for _, token := range c.Tokens {
		if token.Type == LEFT_PAREN {
			parenBalance++
		} else if token.Type == RIGHT_PAREN {
			parenBalance--
			if parenBalance < 0 {
				return errors.New("mismatched parentheses: too many closing parentheses")
			}
		}
	}
	
	if parenBalance > 0 {
		return errors.New("mismatched parentheses: unclosed opening parentheses")
	}

	return nil
}

// convertToPostfix converts infix tokens to postfix notation
func (c *calculator) convertToPostfix() ([]Token, error) {
	output := []Token{}
	operatorStack := []Token{}

	for _, token := range c.Tokens {
		switch token.Type {
		case NUMBER:
			output = append(output, token)
		
		case LEFT_PAREN:
			operatorStack = append(operatorStack, token)
		
		case RIGHT_PAREN:
			// Pop operators until matching left parenthesis
			foundLeftParen := false
			for len(operatorStack) > 0 {
				op := operatorStack[len(operatorStack)-1]
				operatorStack = operatorStack[:len(operatorStack)-1]
				
				if op.Type == LEFT_PAREN {
					foundLeftParen = true
					break
				}
				
				output = append(output, op)
			}
			
			if !foundLeftParen {
				return nil, errors.New("mismatched parentheses")
			}
		
		case OPERATOR:
			// Process operators according to precedence
			for len(operatorStack) > 0 {
				top := operatorStack[len(operatorStack)-1]
				if top.Type == LEFT_PAREN {
					break
				}
				
				// For power operator (^), which is right-associative
				if token.Value == POWER && top.Value == POWER {
					break
				}
				
				// For other operators (left-associative)
				if precedence[token.Value] > precedence[top.Value] {
					break
				}
				
				// Pop the operator
				operatorStack = operatorStack[:len(operatorStack)-1]
				output = append(output, top)
			}
			
			operatorStack = append(operatorStack, token)
		}
	}

	// Pop remaining operators from the stack
	for len(operatorStack) > 0 {
		op := operatorStack[len(operatorStack)-1]
		operatorStack = operatorStack[:len(operatorStack)-1]
		
		if op.Type == LEFT_PAREN {
			return nil, errors.New("mismatched parentheses")
		}
		
		output = append(output, op)
	}

	return output, nil
}

// evaluatePostfix evaluates a postfix expression
func (c *calculator) evaluatePostfix(postfix []Token) (float64, error) {
	var stack []float64

	for _, token := range postfix {
		if token.Type == NUMBER {
			num, err := strconv.ParseFloat(token.Value, 64)
			if err != nil {
				return 0, fmt.Errorf("invalid number: %s", token.Value)
			}
			stack = append(stack, num)
		} else if token.Type == OPERATOR {
			if len(stack) < 2 {
				return 0, errors.New("insufficient operands for operator")
			}
			
			// Pop two operands (note the order: second operand is popped first)
			b := stack[len(stack)-1]
			a := stack[len(stack)-2]
			stack = stack[:len(stack)-2]
			
			// Perform the operation
			var result float64
			switch token.Value {
			case ADD:
				result = a + b
			case SUBTRACT:
				result = a - b
			case MULTIPLY:
				result = a * b
			case DIVIDE:
				if b == 0 {
					return 0, errors.New("division by zero")
				}
				result = a / b
			case POWER:
				result = math.Pow(a, b)
			default:
				return 0, fmt.Errorf("unsupported operator: %s", token.Value)
			}
			
			// Push the result back onto the stack
			stack = append(stack, result)
		}
	}

	if len(stack) != 1 {
		return 0, errors.New("invalid expression: too many operands")
	}

	return stack[0], nil
}

// Calculate evaluates a mathematical expression
func (c *calculator) calculate(expression string) (float64, error) {
	// tokenize the expression
	err := c.tokenize(expression)
	if err != nil {
		return 0, err
	}
	
	// Convert to postfix notation
	postfix, err := c.convertToPostfix()
	if err != nil {
		return 0, err
	}
	
	// Evaluate the postfix expression
	return c.evaluatePostfix(postfix)
}