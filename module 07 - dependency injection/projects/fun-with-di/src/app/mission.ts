const currentInjector: any[] = [];

function inject() {
    const myCaller = currentInjector[0];

}

function Calc() {
    inject();

}

function Group() {
    inject();
}



function angularMagic() {
    currentInjector.push(Calc);
    Calc();
    currentInjector.pop();
}