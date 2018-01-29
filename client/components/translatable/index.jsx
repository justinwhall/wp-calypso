/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Popover from 'components/popover';
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import FormButton from 'components/forms/form-button';
import FormLabel from 'components/forms/form-label';

class Translatable extends Component {
	state = {
		showTooltip: false,
		translatedData: null,
	};

	refCallback = elem => ( this.elem = elem );

	togglePopover = event => {
		event.preventDefault();

		this.setState( { showTooltip: true } );

		if ( this.state.translatedData ) {
			return;
		}
		const { singular, context, plural } = this.props;


		const xhr = new XMLHttpRequest();
		if ( 'withCredentials' in xhr ) {
			xhr.open( 'POST', 'https://translate.wordpress.com/api/translations/-query-by-originals', true );
			xhr.withCredentials = true;
			xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");

			// eslint-disable-next-line

			const data = {
				project: 'wpcom',
				locale_slug: 'it',
				original_strings:  { singular, context, plural },
			};

			xhr.onreadystatechange = ()  => {
				if (xhr.readyState>3 && xhr.status==200) {
					this.setState( { translatedData: JSON.parse(xhr.responseText) } );
				};
			};
			const params = "project=wpcom&locale_slug=it&original_strings=" + encodeURIComponent(JSON.stringify( data ))

			xhr.send( params  );
		}


		this.setState( { showTooltip: true } );
	};

	render() {

		const translatedStr = this.state.translatedData ? this.state.translatedData[ 0 ].translations[0][ 'translation_0' ] : '';

		return (
			<data
				title={ 'do it' }
				className="translatable translatable__community-translator"
				onContextMenu={ this.togglePopover }
				ref={ this.refCallback }
				{ ...this.props }
			>
				{ this.props.children }
				<Popover
					isVisible={ this.state.showTooltip }
					context={ this.elem }
					onClose={ noop }
					position="bottom"
					className="translatable__popover popover"
				>
					<FormFieldset>
						<FormLabel htmlFor="something">something</FormLabel>
						<FormTextInput name="something" placeholder="Add a new translation" value={ translatedStr } />
					</FormFieldset>
					<FormButton type="button" isPrimary={ true }>
						Submit something
					</FormButton>
				</Popover>
			</data>
		);
	}
}

export default Translatable;
