import * as React from 'react';
import * as Redux from 'redux';
import { registerName, unregisterName, requestTransfer, acceptSale } from '../actions/nameService';
import { queryName, queryForSale } from '../api/nameService';
import RegisteredName from './RegisteredName';
import { NamesMap } from './wallet';

interface NameServiceProps extends React.Props<any> {
  dispatch: Redux.Dispatch<any>;
  address: string;
  names: NamesMap;
}

class NameService extends React.Component<NameServiceProps, any> {
  private nameInput;

  constructor(state, props) {
    super(state, props);

    this.state = {
      currentNameOwner: null,
      forSaleAmount: null,
    };
  }

  componentWillMount() {
    this.handleNameLookup = this.handleNameLookup.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.handleTransfer = this.handleTransfer.bind(this);
    this.handleAcceptSale = this.handleAcceptSale.bind(this);
  }

  handleNameLookup() {
    const value = this.nameInput.value;
    Promise.all([queryName(value), queryForSale(value)])
    .then(responses => {
      const address = responses[0];
      const saleAmount = responses[1];
      this.setState({
        ...this.state,
        currentNameOwner: address,
        forSaleAmount: saleAmount,
      });
    });
  }

  handleRegister() {
    const {dispatch, address} = this.props;
    const {value} = this.nameInput;
    dispatch(registerName(value, address));
    alert(`Your registration for the name: ${value} has been submitted to be associated with your address ${address}. Please wait until the next block to validate this transaction.`);
    this.clearRegistration();
  }

  handleTransfer() {
    const {dispatch, address} = this.props;
    const {currentNameOwner} = this.state;
    const name = this.nameInput.value;
    name && currentNameOwner && dispatch(requestTransfer(name, address, currentNameOwner, address));
    alert(`Your request to transfer the name: ${name} from the current owner ${currentNameOwner} to your address ${address} has been submitted. Please wait until the next block to for confirmation. Please also have the owner of this name submit a transfer request as well if they haven't already done so.`);
    this.clearRegistration();
  }

  handleAcceptSale() {
    const {dispatch, address} = this.props;
    const {forSaleAmount} = this.state;
    const name = this.nameInput.value;
    name && forSaleAmount && dispatch(acceptSale(name, address));
    alert(`Your request buy name: ${name} from the current owner, for ${forSaleAmount} hons, has been submitted. Please wait until the next block to for confirmation.`);
    this.clearRegistration();
  }

  clearRegistration() {
    this.nameInput.value = null;
    this.setState({
      ...this.state,
      currentNameOwner: null,
      forSaleAmount: null,
    });
  }

  renderInputField(title, reference) {
    return (
      <div className='input-field'>
        <div>{title}</div>
        <input ref={ref => this[reference] = ref}/>
      </div>
    );
  }

  renderRegister() {
    const {currentNameOwner} = this.state;
    return (
      <div>
        <div>{currentNameOwner ? `This name is already taken by: ${currentNameOwner}` : this.nameInput && this.nameInput.value ? 'This name is free, would you like to register?' : ''}</div>
        {this.renderRegisterForm()}
      </div>
    );
  }

  renderRegisterForm() {
    const {currentNameOwner, forSaleAmount} = this.state;
    if (this.nameInput && this.nameInput.value && !currentNameOwner) {
      return (
        <button onClick={this.handleRegister}>Register now</button>
      );
    }

    if (this.nameInput && this.nameInput.value && currentNameOwner && !forSaleAmount) {
      return (
        <button onClick={this.handleTransfer}>Request transfer</button>
      );
    }

    if (this.nameInput && this.nameInput.value && currentNameOwner && forSaleAmount) {
      return (
        <div>
          <button onClick={this.handleTransfer}>Request transfer</button>
          <div>{`Posted for sale by owner for: ${forSaleAmount} hons`}</div>
          <button onClick={this.handleAcceptSale}>Buy</button>
        </div>
      );
    }
  }

  renderNames() {
    const {names, address, dispatch} = this.props;
    return (
      <div className='names-list'>
        My registered names:
        <ul>
          {names && Object.keys(names).map((name, index) => {
            return (
              <li className='names-list-item' key={index}>
                <RegisteredName
                  dispatch={dispatch}
                  address={address}
                  name={name}
                  saleAmount={names[name]}
                />
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  render() {
    return (
      <div className='name-service'>
        <h3>Name Service</h3>
        {this.renderNames()}
        <br/>
        {this.renderInputField('Look up a name to register: ', 'nameInput')}
        <button onClick={this.handleNameLookup}>Lookup</button>
        {this.renderRegister()}
      </div>
    );
  }
}

export default NameService;
