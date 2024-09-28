const invoices = require("./data/invoices.json")
const plays = require("./data/plays.json")

function createStatementData(invoice, plays) {
    const result = [];
    result.customer = invoice[0].customer;
    result.performances = invoice[0].performances.map(enrichPerformance);
    result.totalAmount = totalAmount(result);
    result.totalVolumeCredits = totalVolumeCredits(result);
    return result;

    function enrichPerformance(aPerformance) {
        const calculator = createPerformanceCalculator(aPerformance, playFor(aPerformance));
        const result = Object.assign({}, aPerformance);
        result.play = calculator.play.type;
        result.amount = calculator.amount;
        result.volumeCredits = calculator.volumeCredits;
        return result;
    }
    function playFor(aPerformance) {
        return plays[aPerformance.playID]
    }
    function totalAmount(data) {
        return data.performances.reduce((total, p) => total + p.amount, 0);
    }
    function totalVolumeCredits(data) {
        return data.performances.reduce((total, p) => total + p.volumeCredits, 0);
    }
}

function createPerformanceCalculator(aPerformance, aPlay) {
    switch (aPlay.type) {
        case "tragedy": return new TragedyCalculator(aPerformance, aPlay);
        case "comedy": return new ComedyCalculator(aPerformance, aPlay);
        default:
            throw new Error(`unknown type: ${aPlay.type}`);
    }
}
class PerformanceCalculator {
    constructor(aPerformance, aPlay) {
        this.performance = aPerformance;
        this.play = aPlay;
    }

    get amount() {
        throw new Error('subclass responsability');
    }
    get volumeCredits() {
        return Math.max(this.performance.audience - 30, 0);
    }
}

class TragedyCalculator extends PerformanceCalculator {
    get amount() {
        let result = 40000;
        if (this.performance.audience > 30) {
            result += 1000 * (this.performance.audience - 30);
        }

        return result;
    }
}

class ComedyCalculator extends PerformanceCalculator {
    get amount() {
        let result = 30000;
        if (this.performance.audience > 20) {
            result += 1000 + 500 * (this.performance.audience - 20);
        }

        result += 300 * this.performance.audience;
        return result;
    }

    get volumeCredits() {
        return super.volumeCredits + Math.floor(this.performance.audience / 5);
    }
}

console.log(createStatementData(invoices, plays));
// Output:
// [
//     customer: 'BigCo',
//     performances: [
//       {
//         playID: 'hamlet',
//         audience: 55,
//         play: 'tragedy',
//         amount: 65000,
//         volumeCredits: 25
//       },
//       {
//         playID: 'as-like',
//         audience: 35,
//         play: 'comedy',
//         amount: 49000,
//         volumeCredits: 12
//       },
//       {
//         playID: 'othello',
//         audience: 40,
//         play: 'tragedy',
//         amount: 50000,
//         volumeCredits: 10
//       }
//     ],
//     totalAmount: 164000,
//     totalVolumeCredits: 47
//   ]