const invoices = require("./data/invoices.json")
const plays = require("./data/plays.json")

function statement(invoice, plays) {
    let totalAmount = 0;
    let volumeCredits = 0;
    let result = `Statement for ${invoice[0].customer}\n`;
    const format = new Intl.NumberFormat("es-ES",
        {
            style: "currency", currency: "EUR",
            minimumFractionDigits: 2
        }).format;

    for (let perf of invoice[0].performances) {
        console.log(perf)
        const play = plays[perf.playID];
        let thisAmount = 0;

        switch (play.type) {
            case "tragedy":
                thisAmount = 40000;
                if (perf.audience > 30) {
                    thisAmount += 1000 * (perf.audience - 30);
                }
                break;

            case "comedy":
                thisAmount = 30000;
                if (perf.audience > 20) {
                    thisAmount += 10000 + 500 * (perf.audience - 20)
                }
                thisAmount + 300 * perf.audience;
                break;

            default:
                throw new Error(`unknown type: ${play.type}`)
        }

        // add volume credits
        volumeCredits += Math.max(perf.audience - 30, 0);
        // add extra credit for every ten comedy attendees
        if ("comedy" === play.type) volumeCredits += Math.floor(perf.audience / 5);

        // print line for this order
        result += `  ${play.name}: ${format(thisAmount / 100)} (${perf.audience} seats)\n`;
        totalAmount += thisAmount;
    }

    result += `Amount owed is ${format(totalAmount / 100)}\n`;
    result += `You earned ${volumeCredits} credits\n`;
    return result;
}

console.log(statement(invoices, plays));

// Output:
// Statement for BigCo
//   Hamlet: 650,00 € (55 seats)
//   As You Like It: 475,00 € (35 seats)
//   Othello: 500,00 € (40 seats)
// Amount owed is 1625,00 €
// You earned 47 credits