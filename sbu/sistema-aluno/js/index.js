// Carregar informações da biblioteca quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema do Aluno carregado');
    
    // Adicionar animações aos cards
    const cards = document.querySelectorAll('.action-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Verificar se há parâmetros de sucesso na URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('cadastro') === 'sucesso') {
        showSuccess('Cadastro realizado com sucesso!');
    }
});