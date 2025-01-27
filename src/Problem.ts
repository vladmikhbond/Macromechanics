export class Problem {
    title: string;
    cond: string;
    init: string;
    answer: string;

    constructor(a: RegExpExecArray) {
        this.title = a[1].trim();
        this.cond = a[3].trim();
        this.init = a[5].trim();
        this.answer = a[7].trim();
    }

    get isAnswerNumber() {
        return !isNaN(+this.answer);
    }
}