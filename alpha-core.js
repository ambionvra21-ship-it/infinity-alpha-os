// ==========================================
// 🧠 INFINITY ALPHA CORE ENGINE v1
// ==========================================

console.log("🧠 Alpha Core Engine Online");


const AlphaCore = {

    data: {

        financeScore: 0,
        weatherScore: 0,
        productivityScore: 0,
        totalScore: 0

    },


    calculateScore(){

        let total =
        this.data.financeScore +
        this.data.weatherScore +
        this.data.productivityScore;


        this.data.totalScore =
        Math.round(total / 3);


        console.log(
            "⭐ Alpha Score:",
            this.data.totalScore
        );


        return this.data.totalScore;

    },


    updateModule(module, value){

        this.data[module] = value;

        console.log(
            "🔄 Alpha Updated:",
            module,
            value
        );

        this.calculateScore();

    }


};


window.AlphaCore = AlphaCore;
