// ==========================================
// 🧠 Alpha Core Engine
// ==========================================

console.log("🧠 Alpha Core Online");

const AlphaCore = {
    version: "1.0.0",
    modules: {},

    register(name, module) {
        this.modules[name] = module;
        console.log(`✅ ${name} registered`);
    }
};

window.AlphaCore = AlphaCore;
