// ==========================================
// INFINITY ALPHA OS
// Alpha Core Engine
// Version 1.0.0
// ==========================================

console.log("🧠 Alpha Core Engine Online");

const AlphaCore = {

    version: "1.0.0",

    modules: {},

    register(name, module){

        this.modules[name] = module;

        console.log("✅ Module Loaded:", name);

    }

};

window.AlphaCore = AlphaCore;
