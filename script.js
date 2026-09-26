
const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target); // 
        }
    });
}, {
    threshold: 0.15
});

revealElements.forEach((el) => observer.observe(el));

/*Desligar e ligar os nós*/
function setupNetwork(svgId, statusId) {
    const svg = document.getElementById(svgId);
    const statusEl = document.getElementById(statusId);
    const nodes = svg.querySelectorAll("[data-node]");
    const edges = svg.querySelectorAll("[data-from]");
    const totalNodes = nodes.length;

    nodes.forEach((node) => {
        node.addEventListener("click", () => {
            node.classList.toggle("node-off");
            updateEdges();
            updateStatus();
        });
    });

    function updateEdges() {
        edges.forEach((edge) => {
            const from = svg.querySelector(`[data-node="${edge.dataset.from}"]`);
            const to = svg.querySelector(`[data-node="${edge.dataset.to}"]`);
            const isOff = from.classList.contains("node-off") || to.classList.contains("node-off");
            edge.classList.toggle("edge-off", isOff);
        });
    }

   function updateStatus() {
    const hubCircle = svg.querySelector(".node-hub");
    const hubNode = hubCircle ? hubCircle.closest("[data-node]") : null;

    if (hubNode && hubNode.classList.contains("node-off")) {
        statusEl.textContent = "Parada: sem o nó central, a rede não funciona.";
        return;
    }

    const activeNodes = [...nodes].filter((n) => !n.classList.contains("node-off"));
    const activeCount = activeNodes.length;

    const adjacency = {};
    activeNodes.forEach((n) => (adjacency[n.dataset.node] = []));

    edges.forEach((edge) => {
        if (!edge.classList.contains("edge-off")) {
            adjacency[edge.dataset.from].push(edge.dataset.to);
            adjacency[edge.dataset.to].push(edge.dataset.from);
        }
    });

    const visited = new Set();
    let maiorGrupo = 0;

    activeNodes.forEach((n) => {
        const id = n.dataset.node;
        if (visited.has(id)) return;
        let fila = [id];
        let tamanho = 0;
        while (fila.length) {
            const atual = fila.pop();
            if (visited.has(atual)) continue;
            visited.add(atual);
            tamanho++;
            fila.push(...adjacency[atual]);
        }
        if (tamanho > maiorGrupo) maiorGrupo = tamanho;
    });

    if (activeCount <= 1) {
        statusEl.textContent = "Parada: não há nós suficientes para se comunicarem.";
    } else if (maiorGrupo === activeCount) {
        statusEl.textContent = `Funcionando perfeitamente: ${activeCount} de ${totalNodes} nós ativos se comunicam.`;
    } else {
        statusEl.textContent = `Fragmentada: só ${maiorGrupo} de ${activeCount} nós ativos se comunicam.`;
    }
}

    function reset() {
        nodes.forEach((n) => n.classList.remove("node-off"));
        edges.forEach((e) => e.classList.remove("edge-off"));
        updateStatus();
    }

    updateStatus();
    return { reset };
}

const redeCentral = setupNetwork("svg-central", "status-central");
const redeMesh = setupNetwork("svg-mesh", "status-mesh");

document.getElementById("btnReligar").addEventListener("click", () => {
    redeCentral.reset();
    redeMesh.reset();
});