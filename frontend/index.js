async function gerarSenhasDeterministicas() {
    const ordemServicoInput = document.getElementById('ordemServico');
    const senha4DigitosElement = document.getElementById('senha4Digitos');
    const senha6DigitosElement = document.getElementById('senha6Digitos');
    const ordemServico = ordemServicoInput.value;

    if (ordemServico) {
        try {
            const response = await fetch('https://senhasparaordemdeservicosbackend.onrender.com/gerar-senhas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ordemServico }),
            });

            if (!response.ok) {
                const error = await response.json();
                senha4DigitosElement.textContent = `Erro: ${error.error || 'Falha ao gerar as senhas.'}`;
                senha6DigitosElement.textContent = '';
                return;
            }

            const data = await response.json();
            senha4DigitosElement.style.color = '#000';
            senha4DigitosElement.innerHTML = `Senha Usuario: <span style="color: green;">${data.senha4}</span>`;
            senha6DigitosElement.innerHTML = `Senha Programação: <span style="color: blue;">${data.senha6}</span>`;

        } catch (error) {
            console.error("Erro ao comunicar com o servidor:", error);
            senha4DigitosElement.textContent = 'Erro ao comunicar com o servidor.';
            senha6DigitosElement.textContent = '';
        }
    } else {
        senha4DigitosElement.style.color = 'red';
        senha4DigitosElement.textContent = 'Por favor, insira a ordem de serviço.';
        senha6DigitosElement.textContent = '';
    }
}

// Adicione um botão para buscar as senhas (opcional)
// async function buscarSenhas() {
//     const ordemServicoInput = document.getElementById('ordemServico');
//     const senha4DigitosElement = document.getElementById('senha4Digitos');
//     const senha6DigitosElement = document.getElementById('senha6Digitos');
//     const ordemServico = ordemServicoInput.value;

//     if (ordemServico) {
//         try {
//             const response = await fetch(`http://localhost:3001/buscar-senhas/${ordemServico}`);

//             if (response.status === 404) {
//                 senha4DigitosElement.textContent = 'Nenhuma senha encontrada para esta ordem de serviço.';
//                 senha6DigitosElement.textContent = '';
//                 return;
//             }

//             if (!response.ok) {
//                 const error = await response.json();
//                 senha4DigitosElement.textContent = `Erro ao buscar: ${error.error || 'Falha ao buscar as senhas.'}`;
//                 senha6DigitosElement.textContent = '';
//                 return;
//             }

//             const data = await response.json();
//             senha4DigitosElement.textContent = `Senha de 4 dígitos: ${data.senha4}`;
//             senha6DigitosElement.textContent = `Senha de 6 dígitos: ${data.senha6}`;

//         } catch (error) {
//             console.error("Erro ao comunicar com o servidor:", error);
//             senha4DigitosElement.textContent = 'Erro ao comunicar com o servidor.';
//             senha6DigitosElement.textContent = '';
//         }
//     } else {
//         senha4DigitosElement.textContent = 'Por favor, insira a ordem de serviço para buscar.';
//         senha6DigitosElement.textContent = '';
//     }
// }
