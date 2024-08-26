const { Endereco } = require('./models');
const express = require('express');
const axios = require('axios');

const app = express();
const port = 4000;

// Endereço inicial
app.get('/', (req, res) => {
    res.send('Hello world');
});

// consultar CEP
app.get('/consulta-cep/:cep', async (req, res) => { 
    const cep = req.params.cep;
    const cepRegex = /^[0-9]{5}-?[0-9]{3}$/;
    
    if (!cepRegex.test(cep)) {
        return res.status(400).send(`CEP inválido. Formato: XXXXX-XXX`);
    }

    try {
        const response = await axios.get(`http://viacep.com.br/ws/${cep}/json/`);
        const enderecoData = response.data;

        if (enderecoData.erro) {
            return res.status(404).send('CEP não encontrado.');
        }

        const novoEndereco = await Endereco.create({
            cep: enderecoData.cep.replace('-', ''),
            logradouro: enderecoData.logradouro,
            numero: null,
            complemento: enderecoData.complemento || '',
            bairro: enderecoData.bairro,
            cidade: enderecoData.localidade,
            estado: enderecoData.uf,
            municipioIBGE: enderecoData.ibge
        });

        res.status(201).json(enderecoData);
    } catch (error) {
        console.error('Erro ao fazer requisição:', error);
        res.status(500).send('Erro ao consultar o CEP.');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});