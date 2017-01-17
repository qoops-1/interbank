# Interbank KYC

Библиотека и тестовое приложение для обмена KYC анкетами при межбанковском взаимодействии.

## Установка

    $ cd interbank
    $ npm link

### Сторонние компоненты

* **Ethereum:** Считаем, что на машине развёрнута эфириум-нода со стандартным HTTP RPC API `http://localhost:8545`.
* **Swarm:** Необходимо, чтобы на машине работал swarm со стандартным HTTP RPC API `http://localhost:8500/bzzr:`. Для установки Swarm следует пройти шаги, изложенные в [Swarm Guide](https://swarm-guide.readthedocs.io/en/latest/installation.html).
 
### Конфигурация

    $ interbank setup

Здесь требуется указать путь к директории с данными Ethereum и адрес банка,
например, `0x843e9747efd6104f197784f99e9714618a47fb81`.

После этого необходимо импортировать ключ получателей вашей KYC карточки в формате JWK:

    $ interbank import 0x843e9747efd6104f197784f99e9714618a47fb81.json
    
По необходимости следует экспортировать свой ключ и передать его контрагенту

    $ interbank export p4$$w0rd /path/to/exported/key.json
    
## Использование

Для загрузки файла KYC анкеты следует выполнить

    $ interbank upload p4$$w0rd /path/to/kyc.pdf --network mc
    
Для выгрузки KYC анкеты контрагента с адресом `0xdeadbeaf`:

    $ interbank download p4$$w0rd /path/to/deadbeaf_kyc.pdf --address 0xdeadbeaf --network mc
    
Пароль `p4$$w0rd` необходим здесь, так как происходит восстановление приватного ключа из его зишафрованной
паролем формы.
