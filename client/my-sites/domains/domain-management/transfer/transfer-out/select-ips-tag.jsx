
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import request from 'superagent';
import { find, isEmpty, startsWith, toUpper } from 'lodash';
import { localize } from 'i18n-calypso';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Dialog from 'components/dialog';
import SearchCard from 'components/search-card';
import SectionHeader from 'components/section-header';
import Suggestions from 'components/suggestions';
import FormButton from 'components/forms/form-button';

const debug = debugFactory( 'calypso:domains:select-ips-tag' );

class SelectIpsTag extends Component {
	static ipsTagListUrl = 'https://widgets.wp.com/domains/ips-tag-list.min.json';

	state = {
		currentQuery: '',
		ipsTagInput: '',
		ipsTagList: [],
		selectedRegistrar: {},
		showDialog: false
	};

	componentWillMount() {
		request.get( SelectIpsTag.ipsTagListUrl ).then( ( response ) => {
			this.receiveIpsTagList( response.body );
		} )
		.catch( ( error ) => {
			debug( 'Failed to load IPS tag list! ' + error );
		} );
	}

	componentDidUpdate() {
		if ( this.state.currentQuery && ( this.state.currentQuery !== this.state.ipsTagInput ) ) {
			this.hideSuggestions();
		}
	}

	receiveIpsTagList = ipsTagList => {
		this.setState( { ipsTagList } );
	}

	handleKeyDown = event => this.suggestionsRef.handleKeyEvent( event );

	handleSearchInputChange = query => this.setState( { currentQuery: query, ipsTagInput: query } );

	handleSuggestionClick = position => {
		const parsedLabel = position.label.split( ' ' );
		this.setState( { ipsTagInput: parsedLabel[ 0 ] } );
	}

	handleSubmit = () => {
		this.props.saveDomainIpsTag( this.props.selectedDomainName, this.state.selectedRegistrar );
	}

	getRegistrarInfo( ipsTag, ipsTagList ) {
		return find( ipsTagList, [ 'tag', ipsTag ] );
	}

	getSuggestions() {
		return this.state.ipsTagList
			.filter( hint => this.state.currentQuery && startsWith( hint.tag, toUpper( this.state.currentQuery ) ) )
			.map( hint => ( { label: hint.tag + '  (' + hint.registrarName + ')' } ) );
	}

	setSuggestionsRef = ref => ( this.suggestionsRef = ref );

	hideSuggestions = () => this.setState( { currentQuery: '' } );

	popOverDialog = () => {
		const { ipsTagInput, ipsTagList } = this.state;
		let selectedRegistrar = this.getRegistrarInfo( ipsTagInput, ipsTagList );

		if ( isEmpty( selectedRegistrar ) ) {
			selectedRegistrar = { tag: toUpper( ipsTagInput ), registrarName: '', registrarUrl: '' };
		}

		this.setState( {
			selectedRegistrar,
			showDialog: true,
		} );
	}

	onCloseDialog = ( action ) => {
		if ( 'submit' === action ) {
			this.handleSubmit();
		}

		this.setState( { showDialog: false } );
	}

	renderGoToGainingRegistrar() {
		const { translate } = this.props;

		return (
			<Card
				className="transfer-out__select-ips-tag"
				href="https://example.com"
				target="_blank"
				highlight="success"
			>
				{ translate(
					'Success! Click here to go to your new registrar and complete the transfer.'
				) }
			</Card>
		);
	}

	renderIpsTagSelect() {
		const { selectedDomainName, translate } = this.props;

		return (
			<div>
				<p>
					{ translate(
						'Please enter the IPS tag of the registrar you wish to transfer ' +
						'{{strong}}%(selectedDomainName)s{{/strong}} to.',
						{ args: { selectedDomainName }, components: { strong: <strong /> } }
					) }
				</p>

				<SearchCard
					autoFocus
					disableAutocorrect
					onSearch={ this.handleSearchInputChange }
					onBlur={ this.hideSuggestions }
					onKeyDown={ this.handleKeyDown }
					placeholder="Start typing an IPS tag..."
					value={ this.state.ipsTagInput }
				/>
				<Suggestions
					ref={ this.setSuggestionsRef }
					query={ this.state.currentQuery }
					suggestions={ this.getSuggestions() }
					suggest={ this.handleSuggestionClick }
				/>
				<FormButton onClick={ this.popOverDialog } >
					{ this.props.translate( 'Submit' ) }
				</FormButton>

				{ this.renderDialog() }
			</div>
		);
	}

	renderDialog() {
		const { selectedDomainName, translate } = this.props;
		const { selectedRegistrar } = this.state;
		const buttons = [
			{ action: 'cancel', label: translate( 'Cancel' ) },
			{ action: 'submit', label: translate( 'Yes, Submit!' ), isPrimary: true },
		];

		return (
			<Dialog
				isVisible={ this.state.showDialog }
				buttons={ buttons }
				onClose={ this.onCloseDialog }>
				<h1>{ translate( 'Transfer Confirmation' ) }</h1>
				<p>
					{ translate( 'Please verify you wish to set the registrar for ' +
						'{{strong}}%(selectedDomainName)s{{/strong}} to the following:',
						{ args: { selectedDomainName }, components: { strong: <strong /> } }
					) }
				</p>
				<p>
					<strong>{ selectedRegistrar.tag }</strong>&nbsp;&nbsp;
					{ selectedRegistrar.registrarName ? '(' + selectedRegistrar.registrarName + ')' : '' }
				</p>
				<p>
					{ translate( 'After submitting this tag change, the domain will no longer be in our system. ' +
						'You will need to contact the gaining registrar to complete the transfer and regain ' +
						'control of the domain.'
					) }
				</p>
			</Dialog>
		);
	}

	render() {
		const { translate } = this.props;

		return (
			<div>
				<SectionHeader label={ translate( 'Transfer Domain To Another Registrar' ) } />
				<Card className="transfer-out__select-ips-tag">
					<p>
						{ translate(
							"{{strong}}.uk{{/strong}} domains are transferred by setting the domain's IPS tag here to the " +
							'value provided by the new registrar and then contacting the {{em}}new registrar{{/em}} to ' +
							'complete the transfer.', { components: { strong: <strong />, em: <em /> } }
						) }
					</p>
					{ this.props.tagWasSet ? this.renderGoToGainingRegistrar() : this.renderIpsTagSelect() }
				</Card>
			</div>
		);
	}
}

export default connect( state => ( { currentUser: getCurrentUser( state ) } ), {
	successNotice,
	errorNotice,
} )( localize( SelectIpsTag ) );
