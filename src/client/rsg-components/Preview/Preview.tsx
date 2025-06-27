import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PlaygroundError from 'rsg-components/PlaygroundError';
import ReactExample from 'rsg-components/ReactExample';
import Context, { StyleGuideContextContents } from 'rsg-components/Context';
import { createRoot, Root } from 'react-dom/client';

const improveErrorMessage = (message: string) =>
	message.replace(
		'Check the render method of `StateHolder`.',
		'Check the code of your example in a Markdown file or in the editor below.'
	);

interface PreviewProps {
	code: string;
	evalInContext(code: string): () => any;
}

interface PreviewState {
	error: string | null;
}

export default class Preview extends Component<PreviewProps, PreviewState> {
	public static propTypes = {
		code: PropTypes.string.isRequired,
		evalInContext: PropTypes.func.isRequired,
	};
	public static contextType = Context;
	// Type assertion to ensure context is properly typed
	public context!: StyleGuideContextContents;

	private mountNode: Element | null = null;
	private reactRoot: Root | null = null;
	private timeoutId: number | null = null;

	public state: PreviewState = {
		error: null,
	};

	public componentDidMount() {
		// Clear console after hot reload, do not clear on the first load
		// to keep any warnings
		if (this.context.codeRevision > 0) {
			// eslint-disable-next-line no-console
			console.clear();
		}

		this.executeCode();
	}

	public shouldComponentUpdate(nextProps: PreviewProps, nextState: PreviewState) {
		return this.state.error !== nextState.error || this.props.code !== nextProps.code;
	}

	public componentDidUpdate(prevProps: PreviewProps) {
		if (this.props.code !== prevProps.code) {
			this.executeCode();
		}
	}

	public componentWillUnmount() {
		this.unmountPreview();
	}

	public unmountPreview() {
		const self = this;
		if (self.timeoutId) {
			clearTimeout(self.timeoutId);
		}
		const id = setTimeout(() => {
			if (self.reactRoot) {
				self.reactRoot.unmount();
				self.reactRoot = null;
			}
		}, 0);
		self.timeoutId = id;
	}

	private executeCode() {
		this.setState({
			error: null,
		});

		const { code } = this.props;
		if (!code) {
			return;
		}

		const wrappedComponent: React.FunctionComponentElement<any> = (
			<ReactExample
				code={code}
				evalInContext={this.props.evalInContext}
				onError={this.handleError}
				compilerConfig={(this.context as StyleGuideContextContents).config.compilerConfig}
			/>
		);

		/* istanbul ignore next */
		window.requestAnimationFrame(() => {
			if (!this.mountNode) {
				return;
			}
			try {
				// Create a new root if needed
				if (this.reactRoot === null && this.mountNode) {
					this.reactRoot = createRoot(this.mountNode);
				}
				
				// Only attempt to render if we have a valid root
				if (this.reactRoot) {
					this.reactRoot.render(wrappedComponent);
				}
			} catch (err) {
				if (err instanceof Error) {
					this.handleError(err);
				}
			}
		});
	}

	private handleError = (err: Error) => {
		this.unmountPreview();

		this.setState({
			error: improveErrorMessage(err.toString()),
		});

		console.error(err); // eslint-disable-line no-console
	};

	private callbackRef = (ref: HTMLDivElement | null) => {
		// If the ref changed to a different node, we need to clean up the old root
		if (this.mountNode !== ref) {
			if (this.reactRoot) {
				this.reactRoot.unmount();
				this.reactRoot = null;
			}
			this.mountNode = ref;
			if (ref) {
				this.reactRoot = createRoot(ref);
			}
		}
	};

	public render() {
		const { error } = this.state;
		return (
			<>
				<div data-testid="mountNode" ref={this.callbackRef} />
				{error && <PlaygroundError message={error} />}
			</>
		);
	}
}
