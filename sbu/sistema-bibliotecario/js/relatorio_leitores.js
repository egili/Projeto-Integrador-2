document.addEventListener("DOMContentLoaded", async () => {
    const rankingContainer = document.querySelector(".table-ranking");

    try {
        const data = await BibliotecaAPI.obterClassificacaoGeral();

        if (!data.aluno || data.aluno.length === 0) {
            rankingContainer.innerHTML = `
                <p style="text-align: center; font-weight: bold; color: #555;">
                    Não há aluno cadastrados no sistema
                </p>
            `;
            return;
        }

        let html = `
            <table class="classification-table">
                <thead>
                    <tr>
                        <th>Nome do Aluno</th>
                        <th>Livros lidos no semestre</th>
                        <th>Classificação</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.aluno.forEach(aluno => {
            let status = "Leitor Iniciante";
            if (aluno.livrosLidos > 5 && aluno.livrosLidos <= 10) status = "Leitor Regular";
            else if (aluno.livrosLidos > 10 && aluno.livrosLidos <= 20) status = "Leitor Ativo";
            else if (aluno.livrosLidos > 20) status = "Leitor Extremo";

            html += `
                <tr>
                    <td>${aluno.nome}</td>
                    <td>${aluno.livrosLidos}</td>
                    <td>${status}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        rankingContainer.innerHTML = html;

    } catch (error) {
        console.error("Erro ao carregar classificação:", error);
        rankingContainer.innerHTML = `<p style="color: red; text-align:center;">Erro ao carregar classificação dos leitores</p>`;
    }
});
