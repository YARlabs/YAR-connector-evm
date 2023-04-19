import ConnectWallet from '../components/wallet/connect';
import MainTab from '../tabs/main-tab';

const main = () => {
    return (
        <div className="image-container set-full-height" style={{ backgroundColor: '#fff' }}>
            <div className="container">
                <div className="row">
                    <div className="col-sm-8 col-sm-offset-2">
                        <div className="wizard-container">
                            <div className="card wizard-card" data-color="red" id="wizard">
                                <form action="" method="">
                                    <div className="wizard-header">
                                        <img src='https://yarchain.org/img/yar_logo.svg' alt='' style={{ width: '25%' }} />
                                        { <ConnectWallet /> }
                                    </div>
                                    <div className="tab-content">
                                        { <MainTab /> }
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default main;