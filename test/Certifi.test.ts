import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { deployContract } from 'ethereum-waffle';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import { Certifi } from '../typechain-types/Certifi';
import { Certifi__factory } from '../typechain-types/factories/Certifi__factory';
import { MockDaiToken__factory } from '../typechain-types/factories/MockDaiToken__factory';
import { MockDaiToken } from '../typechain-types/MockDaiToken';
describe('Certifi tests', () => {
    let owner: SignerWithAddress,
        issuer: SignerWithAddress,
        tokenBank: SignerWithAddress,
        certified: SignerWithAddress;
    let token: MockDaiToken;
    let certifi: Certifi;

    const DATA_URL = 'ipfs://1234567890';
    const CERTIFICATE_DATA_URL = 'ipfs://certificateData';
    const fee = '1000000000000000000';

    beforeEach(async () => {
        [owner, issuer, tokenBank, certified] = await ethers.getSigners();
        token = (await deployContract(
            tokenBank,
            MockDaiToken__factory,
            []
        )) as MockDaiToken;
        const args = [token.address, fee];
        certifi = (await deployContract(
            owner,
            Certifi__factory,
            args
        )) as Certifi;
    });

    describe('Registration', () => {
        it('Should create registration request', async () => {
            await expect(
                certifi.connect(issuer).createRegistrationRequest(DATA_URL)
            )
                .to.emit(certifi, 'RegistrationRequested')
                .withArgs(issuer.address, DATA_URL);

            const request = await certifi.getRegistrationRequest(
                issuer.address
            );

            expect(request.decision).to.be.equal(1);
            expect(request.requesterDataUrl).to.be.equal(DATA_URL);
        });

        it('Should revert when already pending', async () => {
            await certifi.connect(issuer).createRegistrationRequest(DATA_URL);

            await expect(
                certifi.connect(issuer).createRegistrationRequest(DATA_URL)
            ).to.be.revertedWith('Certifi__RegistrationProcessAlreadyStarted');
        });

        it('Should be registered', async () => {
            await certifi.connect(issuer).createRegistrationRequest(DATA_URL);

            await expect(certifi.finalizeRegistration(issuer.address, 2))
                .to.emit(certifi, 'IssuerRegistered')
                .withArgs(1, issuer.address, DATA_URL);

            const request = await certifi.getRegistrationRequest(
                issuer.address
            );

            expect(request.decision).to.be.equal(2);

            expect(await certifi.getIssuerId(issuer.address)).to.be.equal(1);
            const registeredIssuer = await certifi.getIssuerById(1);

            expect(registeredIssuer.manageable).to.be.false;
            expect(registeredIssuer.wallet).to.be.equal(issuer.address);
            expect(registeredIssuer.id).to.be.equal(1);
            expect(registeredIssuer.dataUrl).to.be.equal(DATA_URL);
        });

        it('Should registration be rejected', async () => {
            await certifi.connect(issuer).createRegistrationRequest(DATA_URL);

            await expect(certifi.finalizeRegistration(issuer.address, 3))
                .to.emit(certifi, 'RegistrationRejected')
                .withArgs(issuer.address);

            const request = await certifi.getRegistrationRequest(
                issuer.address
            );

            expect(request.decision).to.be.equal(3);

            expect(await certifi.getIssuerId(issuer.address)).to.be.equal(0);
            const registeredIssuer = await certifi.getIssuerById(0);

            expect(registeredIssuer.manageable).to.be.false;
            expect(registeredIssuer.wallet).to.be.equal(
                ethers.constants.AddressZero
            );
            expect(registeredIssuer.id).to.be.equal(0);
            expect(registeredIssuer.dataUrl).to.be.equal('');
        });

        it('Should revert when wrong decision', async () => {
            await certifi.connect(issuer).createRegistrationRequest(DATA_URL);

            await expect(
                certifi.finalizeRegistration(issuer.address, 1)
            ).to.be.revertedWith('Certifi__WrongDecision');
        });

        it('Should revert when not pending', async () => {
            await expect(
                certifi.finalizeRegistration(issuer.address, 1)
            ).to.be.revertedWith('Certifi__RequestNotPending');
        });

        it('Should revert when already registered', async () => {
            await certifi.connect(issuer).createRegistrationRequest(DATA_URL);
            await certifi.finalizeRegistration(issuer.address, 2);

            await expect(
                certifi.connect(issuer).createRegistrationRequest(DATA_URL)
            ).to.be.revertedWith('Certifi__IssuerAlreadyRegistered');
        });

        it('Should create a registration request if rejected', async () => {
            await certifi.connect(issuer).createRegistrationRequest(DATA_URL);
            await certifi.finalizeRegistration(issuer.address, 3);
            const anotherDataUrl = 'ipfs://anotherData';

            await expect(
                certifi
                    .connect(issuer)
                    .createRegistrationRequest(anotherDataUrl)
            )
                .to.emit(certifi, 'RegistrationRequested')
                .withArgs(issuer.address, anotherDataUrl);

            const request = await certifi.getRegistrationRequest(
                issuer.address
            );

            expect(request.decision).to.be.equal(1);
            expect(request.requesterDataUrl).to.be.equal(anotherDataUrl);
        });
    });

    describe('Certificate issuing', () => {
        const tokens = '10000000000000000000';
        beforeEach(async () => {
            await certifi.connect(issuer).createRegistrationRequest(DATA_URL);
            await certifi.finalizeRegistration(issuer.address, 2);
            await token.connect(tokenBank).transfer(issuer.address, tokens);
            await token.connect(issuer).approve(certifi.address, tokens);
        });

        it('Should deposit tokens', async () => {
            await expect(certifi.connect(issuer).deposit(tokens))
                .to.emit(certifi, 'Deposited')
                .withArgs(issuer.address, tokens);

            expect(await certifi.getTokenBalance(issuer.address)).to.be.equal(
                tokens
            );
            expect(await token.balanceOf(certifi.address)).to.be.equal(tokens);
        });

        it('Should withdraw tokens', async () => {
            const toWithdraw = '1000000000000000000';
            await certifi.connect(issuer).deposit(tokens);
            await expect(
                certifi.connect(issuer)['withdraw(uint256)'](toWithdraw)
            )
                .to.emit(certifi, 'Withdrawn')
                .withArgs(issuer.address, toWithdraw);
            expect(await certifi.getTokenBalance(issuer.address)).to.be.equal(
                '9000000000000000000'
            );
            expect(await token.balanceOf(certifi.address)).to.be.equal(
                '9000000000000000000'
            );
            expect(await token.balanceOf(issuer.address)).to.be.equal(
                toWithdraw
            );
        });

        it('Should revert when withdraw more than have', async () => {
            await expect(
                certifi.connect(issuer)['withdraw(uint256)'](1)
            ).to.revertedWith('Certifi_WithdrawFailed');
        });

        it('Should revert when balance less then fee', async () => {
            await expect(
                certifi
                    .connect(issuer)
                    .issueCertificate(certified.address, CERTIFICATE_DATA_URL)
            ).to.be.revertedWith('Certifi_InsufficientBalance');
        });

        it('Should revert when an issuer not registered', async () => {
            await expect(
                certifi
                    .connect(tokenBank)
                    .issueCertificate(certified.address, CERTIFICATE_DATA_URL)
            ).to.be.revertedWith('Certifi__IssuerNotRegistered');
        });
        it('Should create a certificate', async () => {
            await certifi.connect(issuer).deposit(tokens);

            const issuerBalanceBefore = await certifi.getTokenBalance(
                issuer.address
            );

            await expect(
                certifi
                    .connect(issuer)
                    .issueCertificate(certified.address, CERTIFICATE_DATA_URL)
            )
                .to.emit(certifi, 'CertificateIssued')
                .withArgs(1, certified.address, CERTIFICATE_DATA_URL);

            const expectedIssuerBalanceAfter = issuerBalanceBefore.sub(
                BigNumber.from(fee)
            );

            expect(await certifi.getTokenBalance(issuer.address)).to.be.equal(
                expectedIssuerBalanceAfter
            );
            expect(await certifi.getTokenBalance(certifi.address)).to.be.equal(
                fee
            );

            const certificates: any[] = await certifi.getCertificates(
                certified.address
            );
            expect(certificates.length).to.be.equal(1);

            const certificate = certificates[0];

            expect(certificate.owner).to.be.equal(certified.address);
            expect(certificate.issuerId).to.be.equal(1);
            expect(certificate.dataUrl).to.be.equal(CERTIFICATE_DATA_URL);
        });

        it('Should revert when not the owner withdraw fees', async () => {
            await expect(
                certifi.connect(issuer)['withdraw(address)'](issuer.address)
            ).to.be.revertedWith('Ownable: caller is not the owner');
        });

        it('Should withdraw fees', async () => {
            await certifi.connect(issuer).deposit(tokens);
            await certifi
                .connect(issuer)
                .issueCertificate(certified.address, CERTIFICATE_DATA_URL);

            await expect(certifi['withdraw(address)'](owner.address))
                .to.emit(certifi, 'FeesCollected')
                .withArgs(fee);
            expect(await certifi.getTokenBalance(owner.address)).to.be.equal(0);
        });
    });
});
