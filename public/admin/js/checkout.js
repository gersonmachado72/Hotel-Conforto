async function finalizarEstadia(hospedeId) {
    console.log('Finalizar estadia para hóspede:', hospedeId);
    
    // 1. Buscar reservas ativas do hóspede
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`/api/reservas?hospede_id=${hospedeId}&status_reserva=confirmada`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao buscar reservas');
        }
        
        const reservas = await response.json();
        
        if (reservas.length === 0) {
            alert('Este hóspede não possui reservas ativas.');
            return;
        }
        
        const reserva = reservas[0];
        
        // 2. Confirmar checkout
        if (confirm(`Confirmar checkout da reserva ${reserva.codigo_reserva}?`)) {
            const checkoutResponse = await fetch(`/api/reservas/${reserva.id}/checkout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data_real_checkout: new Date().toISOString().split('T')[0],
                    status_reserva: 'concluida'
                })
            });
            
            if (checkoutResponse.ok) {
                alert('✅ Checkout realizado com sucesso!');
                location.reload();
            } else {
                throw new Error('Erro no checkout');
            }
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro ao finalizar estadia');
    }
}
