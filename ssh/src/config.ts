import * as os from 'os';
import * as path from 'path';
import * as process from 'process';
import * as vscode from 'vscode';

export const DefaultTimeout = 5;
export const DefaultDisplayCommand = 'bash -c "echo DISPLAY=$DISPLAY"';

export type AuthenticationMethod = 'agent' | 'keyFile';

export function getConfig<T>(name: string, defaultValue: T): T {
	const config = vscode.workspace.getConfiguration('remoteX11');
	return config.get(name, defaultValue);
}

export function getDisplay() {
	return getConfig('display', 0);
}

export function getScreen() {
	return getConfig('screen', 0);
}

export function getAuthenticationMethod() {
	return getConfig<AuthenticationMethod>('SSH.authenticationMethod', 'keyFile');
}

export function getAgent() {
	return getConfig('SSH.agent', '') || getDefaultAgent();
}

export function getPrivateKey() {
	return resolveHome(getConfig('SSH.privateKey', '~/.ssh/id_rsa'));
}

export function getServerHost() {
	return getConfig<string | null>('SSH.host', null);
}

export function getServerPort() {
	return getConfig<number | null>('SSH.port', null);
}

export function getDisplayCommand() {
	return getConfig('SSH.displayCommand', DefaultDisplayCommand);
}

export function getTimeout() {
	return getConfig('SSH.timeout', DefaultTimeout);
}

export function isVerboseLoggingEnabled() {
	return getConfig('SSH.verboseLogging', false);
}

function getDefaultAgent() {
	if (os.platform() === 'win32') {
		return '\\\\.\\pipe\\openssh-ssh-agent';
	} else {
		const socket = process.env['SSH_AUTH_SOCK'];

		if (socket === undefined) {
			throw new Error('Cannot find SSH Agent. SSH_AUTH_SOCK environment variable is not set.');
		}

		return socket;
	}
}

function resolveHome(file: string) {
	if (file === '~') {
		return os.homedir();
	}

	if (file.startsWith('~/') || file.startsWith('~\\')) {
		return path.join(os.homedir(), file.slice(2));
	}

	return file;
}
