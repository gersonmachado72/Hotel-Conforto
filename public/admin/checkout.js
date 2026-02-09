// ========== FUNÇÕES DE CHECK-OUT ==========

async function finalizarEstadia(hospedeId) {
    try {
        // 1. Buscar reservas ativas do hóspede
        const response = await fetch(`/api/checkout/hospede/${hospedeId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            alert('Erro ao buscar reservas do hóspede');
            return;
        }
        
        const reservas = await response.json();
        
        if (!reservas || reservas.length === 0) {
            alert('Este hóspede não possui reservas ativas para check-out');
            return;
        }
        
        // 2. Mostrar modal de seleção se tiver mais de uma reserva
        if (reservas.length > 1) {
            const reservaOptions = reservas.map(r => 
                `<option value="${r.id}">Reserva ${r.codigo_reserva} - Quarto ${r.Quarto.numero} (Check-in: ${r.data_checkin})</option>`
            ).join('');
            
            const modalHTML = `
                <div style="margin-bottom: 20px;">
                    <h3>Selecione a Reserva para Check-out</h3>
                    <p>Hóspede: ${reservas[0].Hospede.nome}</p>
                    
                    <div class="form-group">
                        <label for="selectReserva">Reserva:</label>
                        <select id="selectReserva" class="form-control" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 5px;">
                            ${reservaOptions}
                        </select>
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button class="btn btn-primary" onclick="carregarDetalhesCheckout(${hospedeId})" style="flex: 1;">
                            <i class="fas fa-arrow-right"></i> Continuar
                        </button>
                        <button class="btn" onclick="fecharModalCheckout()" style="flex: 1; background: #f8f9fa;">
                            Cancelar
                        </button>
                    </div>
                </div>
            `;
            
            document.getElementById('checkoutDetalhes').innerHTML = modalHTML;
            document.getElementById('modalCheckout').style.display = 'flex';
            document.getElementById('modalCheckoutTitulo').textContent = 'Selecionar Reserva para Check-out';
            
        } else {
            // Se só tiver uma reserva, carregar direto
            await carregarDetalhesCheckout(hospedeId, reservas[0].id);
        }
        
    } catch (error) {
        console.error('Erro ao iniciar check-out:', error);
        alert('Erro ao processar check-out');
    }
}

async function carregarDetalhesCheckout(hospedeId, reservaId = null) {
    try {
        // Se não tiver reservaId, pegar do select
        if (!reservaId) {
            reservaId = document.getElementById('selectReserva').value;
        }
        
        // Buscar detalhes da reserva
        const response = await fetch(`/api/checkout/reserva/${reservaId}/detalhes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao buscar detalhes da reserva');
        }
        
        const data = await response.json();
        const { reserva, calculo } = data;
        
        // Calcular data atual como padrão para check-out
        const hoje = new Date();
        const hojeFormatado = hoje.toISOString().split('T')[0];
        
        // Criar formulário de check-out
        const checkoutHTML = `
            <div style="max-height: 60vh; overflow-y: auto; padding-right: 10px;">
                <!-- Informações do Hóspede -->
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <h3><i class="fas fa-user"></i> Informações do Hóspede</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                        <div>
                            <p><strong>Nome:</strong> ${reserva.Hospede.nome}</p>
                            <p><strong>CPF:</strong> ${reserva.Hospede.cpf}</p>
                        </div>
                        <div>
                            <p><strong>Email:</strong> ${reserva.Hospede.email}</p>
                            <p><strong>Telefone:</strong> ${reserva.Hospede.telefone}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Informações da Reserva -->
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <h3><i class="fas fa-calendar-alt"></i> Informações da Reserva</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                        <div>
                            <p><strong>Código:</strong> ${reserva.codigo_reserva}</p>
                            <p><strong>Quarto:</strong> ${reserva.Quarto.numero} (${reserva.Quarto.tipo})</p>
                        </div>
                        <div>
                            <p><strong>Check-in:</strong> ${reserva.data_checkin}</p>
                            <p><strong>Check-out Previsto:</strong> ${reserva.data_checkout}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Cálculo da Conta -->
                <div style="background: #fff8e1; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <h3><i class="fas fa-calculator"></i> Cálculo da Conta</h3>
                    
                    <div style="margin: 15px 0;">
                        <div class="form-group">
                            <label for="dataRealCheckout">Data Real do Check-out *</label>
                            <input type="date" id="dataRealCheckout" value="${hojeFormatado}" 
                                   min="${reserva.data_checkin}" max="${hojeFormatado}" 
                                   style="width: 100%; padding: 8px; border: 2px solid #ddd; border-radius: 5px;">
                        </div>
                    </div>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">Diária:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">R$ ${calculo.diaria.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">Dias de Estadia:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">${calculo.dias} dias</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">Valor Hospedagem:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">R$ ${calculo.valor_hospedagem.toFixed(2)}</td>
                        </tr>
                        
                        <!-- Extras -->
                        <tr>
                            <td colspan="2" style="padding: 8px; padding-top: 15px; font-weight: bold;">Extras:</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;">Alimentação:</td>
                            <td style="padding: 8px; text-align: right;">
                                <input type="number" id="extraAlimentacao" value="${reserva.extras?.alimentacao || 0}" 
                                       step="0.01" min="0" style="width: 120px; text-align: right; padding: 5px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;">Lavanderia:</td>
                            <td style="padding: 8px; text-align: right;">
                                <input type="number" id="extraLavanderia" value="${reserva.extras?.lavanderia || 0}" 
                                       step="0.01" min="0" style="width: 120px; text-align: right; padding: 5px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;">Telefone:</td>
                            <td style="padding: 8px; text-align: right;">
                                <input type="number" id="extraTelefone" value="${reserva.extras?.telefone || 0}" 
                                       step="0.01" min="0" style="width: 120px; text-align: right; padding: 5px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;">Outros:</td>
                            <td style="padding: 8px; text-align: right;">
                                <input type="number" id="extraOutros" value="${reserva.extras?.outros || 0}" 
                                       step="0.01" min="0" style="width: 120px; text-align: right; padding: 5px;">
                            </td>
                        </tr>
                        
                        <!-- Total -->
                        <tr style="border-top: 2px solid #333;">
                            <td style="padding: 12px 8px; font-weight: bold;">TOTAL:</td>
                            <td style="padding: 12px 8px; text-align: right; font-weight: bold; font-size: 1.2rem;" id="totalConta">
                                R$ ${calculo.total.toFixed(2)}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;">Já Pago:</td>
                            <td style="padding: 8px; text-align: right;">R$ ${calculo.pago.toFixed(2)}</td>
                        </tr>
                        <tr style="background: #f0f8ff;">
                            <td style="padding: 10px 8px; font-weight: bold;">SALDO A PAGAR:</td>
                            <td style="padding: 10px 8px; text-align: right; font-weight: bold; color: #e74c3c; font-size: 1.2rem;" id="saldoPagar">
                                R$ ${calculo.saldo.toFixed(2)}
                            </td>
                        </tr>
                    </table>
                </div>
                
                <!-- Forma de Pagamento -->
                <div style="margin-bottom: 20px;">
                    <h3><i class="fas fa-credit-card"></i> Forma de Pagamento</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;">
                        <div class="form-group">
                            <label for="metodoPagamento">Método de Pagamento *</label>
                            <select id="metodoPagamento" style="width: 100%; padding: 8px; border: 2px solid #ddd; border-radius: 5px;">
                                <option value="dinheiro">Dinheiro</option>
                                <option value="cartao">Cartão</option>
                                <option value="pix">PIX</option>
                                <option value="transferencia">Transferência</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="valorPago">Valor Pago (R$) *</label>
                            <input type="number" id="valorPago" value="${calculo.total.toFixed(2)}" 
                                   step="0.01" min="0" style="width: 100%; padding: 8px; border: 2px solid #ddd; border-radius: 5px;">
                        </div>
                    </div>
                </div>
                
                <!-- Observações -->
                <div class="form-group">
                    <label for="observacoesCheckout">Observações</label>
                    <textarea id="observacoesCheckout" rows="3" style="width: 100%; padding: 8px; border: 2px solid #ddd; border-radius: 5px;" 
                              placeholder="Observações sobre o check-out...">${reserva.observacoes || ''}</textarea>
                </div>
                
                <!-- Botões de Ação -->
                <div style="display: flex; gap: 15px; margin-top: 25px;">
                    <button class="btn btn-success" onclick="processarCheckout(${reserva.id})" style="flex: 1;">
                        <i class="fas fa-check"></i> Finalizar Check-out
                    </button>
                    <button class="btn" onclick="fecharModalCheckout()" style="flex: 1; background: #f8f9fa;">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('checkoutDetalhes').innerHTML = checkoutHTML;
        document.getElementById('modalCheckout').style.display = 'flex';
        document.getElementById('modalCheckoutTitulo').textContent = `Check-out - ${reserva.Hospede.nome}`;
        
        // Adicionar eventos para atualizar cálculo em tempo real
        document.getElementById('dataRealCheckout').addEventListener('change', () => atualizarCalculoCheckout(reserva));
        document.getElementById('extraAlimentacao').addEventListener('input', () => atualizarCalculoCheckout(reserva));
        document.getElementById('extraLavanderia').addEventListener('input', () => atualizarCalculoCheckout(reserva));
        document.getElementById('extraTelefone').addEventListener('input', () => atualizarCalculoCheckout(reserva));
        document.getElementById('extraOutros').addEventListener('input', () => atualizarCalculoCheckout(reserva));
        document.getElementById('valorPago').addEventListener('input', () => atualizarCalculoCheckout(reserva));
        
    } catch (error) {
        console.error('Erro ao carregar detalhes do check-out:', error);
        alert('Erro ao carregar detalhes do check-out');
    }
}

function atualizarCalculoCheckout(reserva) {
    try {
        const dataRealCheckout = document.getElementById('dataRealCheckout').value;
        const checkinDate = new Date(reserva.data_checkin);
        const checkoutDate = new Date(dataRealCheckout);
        
        // Calcular dias
        const diffTime = Math.abs(checkoutDate - checkinDate);
        const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Calcular valor da hospedagem
        const diaria = parseFloat(reserva.Quarto.preco_noite);
        const valorHospedagem = dias * diaria;
        
        // Calcular extras
        const extraAlimentacao = parseFloat(document.getElementById('extraAlimentacao').value) || 0;
        const extraLavanderia = parseFloat(document.getElementById('extraLavanderia').value) || 0;
        const extraTelefone = parseFloat(document.getElementById('extraTelefone').value) || 0;
        const extraOutros = parseFloat(document.getElementById('extraOutros').value) || 0;
        const extrasTotal = extraAlimentacao + extraLavanderia + extraTelefone + extraOutros;
        
        // Calcular total
        const total = valorHospedagem + extrasTotal;
        
        // Calcular valor pago e saldo
        const valorPago = parseFloat(document.getElementById('valorPago').value) || 0;
        const saldo = total - valorPago;
        
        // Atualizar exibição
        document.getElementById('totalConta').textContent = `R$ ${total.toFixed(2)}`;
        document.getElementById('saldoPagar').textContent = `R$ ${saldo.toFixed(2)}`;
        
        // Mudar cor do saldo
        if (saldo > 0) {
            document.getElementById('saldoPagar').style.color = '#e74c3c'; // Vermelho para débito
        } else if (saldo < 0) {
            document.getElementById('saldoPagar').style.color = '#f39c12'; // Laranja para troco
            document.getElementById('saldoPagar').textContent = `Troco: R$ ${Math.abs(saldo).toFixed(2)}`;
        } else {
            document.getElementById('saldoPagar').style.color = '#27ae60'; // Verde para quitado
            document.getElementById('saldoPagar').textContent = 'QUITADO';
        }
        
    } catch (error) {
        console.error('Erro ao atualizar cálculo:', error);
    }
}

async function processarCheckout(reservaId) {
    if (!confirm('Confirmar finalização do check-out? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    try {
        // Coletar dados do formulário
        const data = {
            data_real_checkout: document.getElementById('dataRealCheckout').value,
            valor_pago: parseFloat(document.getElementById('valorPago').value) || 0,
            metodo_pagamento: document.getElementById('metodoPagamento').value,
            observacoes: document.getElementById('observacoesCheckout').value,
            extras: {
                alimentacao: parseFloat(document.getElementById('extraAlimentacao').value) || 0,
                lavanderia: parseFloat(document.getElementById('extraLavanderia').value) || 0,
                telefone: parseFloat(document.getElementById('extraTelefone').value) || 0,
                outros: parseFloat(document.getElementById('extraOutros').value) || 0
            }
        };
        
        // Enviar para API
        const response = await fetch(`/api/checkout/${reservaId}`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao processar check-out');
        }
        
        const result = await response.json();
        
        // Mostrar recibo
        mostrarRecibo(result.recibo);
        
        // Atualizar listas
        setTimeout(() => {
            if (currentSection === 'reservas') loadReservas(filtroReservaAtual);
            if (currentSection === 'hospedes') loadHospedes();
            loadDashboard();
            loadQuartos();
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao processar check-out:', error);
        alert('Erro ao processar check-out: ' + error.message);
    }
}

function mostrarRecibo(recibo) {
    const reciboHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="color: #27ae60; font-size: 4rem; margin-bottom: 20px;">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2 style="color: #27ae60;">Check-out Concluído!</h2>
            <p>Estadia finalizada com sucesso.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
                <h3 style="margin-bottom: 15px; border-bottom: 2px solid #3498db; padding-bottom: 5px;">Recibo</h3>
                
                <div style="margin-bottom: 10px;">
                    <p><strong>Código:</strong> ${recibo.codigo_reserva}</p>
                    <p><strong>Hóspede:</strong> ${recibo.hospede.nome}</p>
                    <p><strong>CPF:</strong> ${recibo.hospede.cpf}</p>
                </div>
                
                <div style="margin-bottom: 10px;">
                    <p><strong>Quarto:</strong> ${recibo.quarto.numero} (${recibo.quarto.tipo})</p>
                    <p><strong>Período:</strong> ${recibo.periodo.checkin} até ${recibo.periodo.checkout} (${recibo.periodo.dias} dias)</p>
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h4>Valores:</h4>
                    <table style="width: 100%;">
                        <tr>
                            <td>Hospedagem (${recibo.periodo.dias} dias × R$ ${recibo.valores.diaria.toFixed(2)}):</td>
                            <td style="text-align: right;">R$ ${recibo.valores.hospedagem.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Extras:</td>
                            <td style="text-align: right;">R$ ${recibo.valores.extras.toFixed(2)}</td>
                        </tr>
                        <tr style="border-top: 2px solid #333; font-weight: bold;">
                            <td>TOTAL:</td>
                            <td style="text-align: right;">R$ ${recibo.valores.total.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Valor Pago:</td>
                            <td style="text-align: right;">R$ ${recibo.valores.pago.toFixed(2)}</td>
                        </tr>
                        ${recibo.valores.troco !== 0 ? `
                        <tr style="color: ${recibo.valores.troco > 0 ? '#e74c3c' : '#27ae60'};">
                            <td>${recibo.valores.troco > 0 ? 'Saldo Pendente:' : 'Troco:'}</td>
                            <td style="text-align: right;">R$ ${Math.abs(recibo.valores.troco).toFixed(2)}</td>
                        </tr>
                        ` : ''}
                    </table>
                </div>
                
                <div style="margin-top: 15px;">
                    <p><strong>Pagamento:</strong> ${recibo.pagamento.metodo}</p>
                    <p><strong>Status:</strong> <span class="badge badge-${recibo.pagamento.status}">${recibo.pagamento.status}</span></p>
                    <p><strong>Data Finalização:</strong> ${new Date(recibo.data_finalizacao).toLocaleString('pt-BR')}</p>
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <button class="btn btn-primary" onclick="imprimirRecibo()" style="margin-right: 10px;">
                    <i class="fas fa-print"></i> Imprimir Recibo
                </button>
                <button class="btn" onclick="fecharModalCheckout()" style="background: #f8f9fa;">
                    <i class="fas fa-times"></i> Fechar
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('checkoutDetalhes').innerHTML = reciboHTML;
}

function imprimirRecibo() {
    const reciboContent = document.getElementById('checkoutDetalhes').innerHTML;
    const janelaImpressao = window.open('', '_blank');
    janelaImpressao.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Recibo Check-out</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .recibo { max-width: 800px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; }
                .detalhes { margin: 20px 0; }
                table { width: 100%; border-collapse: collapse; }
                td { padding: 8px; border-bottom: 1px solid #ddd; }
                .total { font-weight: bold; font-size: 1.2em; }
                @media print {
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="recibo">
                ${reciboContent}
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => window.close(), 1000);
                }
            <\/script>
        </body>
        </html>
    `);
    janelaImpressao.document.close();
}

function fecharModalCheckout() {
    document.getElementById('modalCheckout').style.display = 'none';
}

// Variável para controlar seção atual
let currentSection = 'dashboard';
