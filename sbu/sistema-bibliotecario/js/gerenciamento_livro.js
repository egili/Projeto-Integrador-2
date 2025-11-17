document.addEventListener("DOMContentLoaded", () => {
    
    const tabs = document.querySelectorAll(".tab-button");
    const tabPanes = document.querySelectorAll(".tab-pane");

    const loadArea = {
        livros: document.querySelector("#todos-livros .data-view"),
        pendentes: document.querySelector("#pendentes .data-view"),
        historico: document.querySelector("#historico .data-view")
    };

    // -----------------------------------------
    // Troca de abas
    // -----------------------------------------
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const tabName = tab.dataset.tab;

            tabPanes.forEach(p => p.style.display = "none");
            document.querySelector(`#${tabName}`).style.display = "block";

            if (tabName === "todos-livros") carregarLivros();
            if (tabName === "pendentes") carregarPendentes();
            if (tabName === "historico") carregarHistorico();
        });
    });

    // -----------------------------------------
    // Carregar estoque de livros
    // -----------------------------------------
    async function carregarLivros() {
        loadArea.livros.innerHTML = `<p>Carregando dados...</p>`;

        try {
            const livros = await BibliotecaAPI.listarTodosLivros();

            if (!livros || livros.length === 0) {
                loadArea.livros.innerHTML = `
                    <p class="empty-message">
                        Nenhum livro cadastrado no sistema.
                    </p>`;
                return;
            }

            renderizarLivros(livros);

        } catch (err) {
            console.error('Erro ao carregar livros:', err);
            loadArea.livros.innerHTML = `
                <p class="error">
                    Erro ao carregar livros: ${err.message || 'Erro desconhecido'}
                </p>`;
        }
    }

    // Renderiza lista de livros
    function renderizarLivros(lista) {
        let html = `
            <table class="table-ranking">
                <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Autor</th>
                    <th>Editora</th>
                </tr>
        `;

        lista.forEach(livro => {
            html += `
                <tr>
                    <td>${livro.id}</td>
                    <td>${livro.titulo}</td>
                    <td>${livro.autor || "—"}</td>
                    <td>${livro.editora || "—"}</td>
                </tr>`;
        });

        html += "</table>";

        loadArea.livros.innerHTML = html;
    }

    // -----------------------------------------
    // Pendentes
    // -----------------------------------------
    async function carregarPendentes() {
        loadArea.pendentes.innerHTML = `<p>Carregando dados...</p>`;

        try {
            const pendentes = await BibliotecaAPI.listarEmprestimosPendentes();

            if (!pendentes || pendentes.length === 0) {
                loadArea.pendentes.innerHTML = `
                    <p class="empty-message">
                        Não há empréstimos pendentes.
                    </p>`;
                return;
            }

            renderizarPendentes(pendentes);

        } catch (err) {
            console.error('Erro ao carregar pendentes:', err);
            loadArea.pendentes.innerHTML = `
                <p class="error">
                    Erro ao carregar pendentes: ${err.message || 'Erro desconhecido'}
                </p>`;
        }
    }

    function renderizarPendentes(lista) {
        let html = `
            <table class="table-ranking">
                <tr>
                    <th>ID Empréstimo</th>
                    <th>Livro</th>
                    <th>Usuário</th>
                    <th>Data</th>
                </tr>
        `;

        lista.forEach(e => {
            html += `
                <tr>
                    <td>${e.id}</td>
                    <td>${e.livro}</td>
                    <td>${e.aluno}</td>
                    <td>${formatDate(e.data)}</td>
                </tr>
            `;
        });

        html += "</table>";

        loadArea.pendentes.innerHTML = html;
    }

    // -----------------------------------------
    // Histórico
    // -----------------------------------------
    async function carregarHistorico() {
        loadArea.historico.innerHTML = `<p>Carregando dados...</p>`;

        try {
            const hist = await BibliotecaAPI.listarHistoricoEmprestimos();

            if (!hist || hist.length === 0) {
                loadArea.historico.innerHTML = `
                    <p class="empty-message">
                        Não há histórico de empréstimos.
                    </p>`;
                return;
            }

            renderizarHistorico(hist);

        } catch (err) {
            console.error('Erro ao carregar histórico:', err);
            loadArea.historico.innerHTML = `
                <p class="error">
                    Erro ao carregar histórico: ${err.message || 'Erro desconhecido'}
                </p>`;
        }
    }

    function renderizarHistorico(lista) {
        let html = `
            <table class="table-ranking">
                <tr>
                    <th>ID</th>
                    <th>Livro</th>
                    <th>Usuário</th>
                    <th>Emprestado</th>
                    <th>Devolvido</th>
                </tr>
        `;

        lista.forEach(h => {
            html += `
                <tr>
                    <td>${h.id}</td>
                    <td>${h.livro}</td>
                    <td>${h.aluno}</td>
                    <td>${formatDate(h.data_emprestimo)}</td> 
                    <td>${h.data_devolucao ? formatDate(h.data_devolucao) : "—"}</td> 
                </tr>`;
        });

        html += "</table>";

        loadArea.historico.innerHTML = html;
    }

    // Carregar a aba inicial
    carregarLivros();
});