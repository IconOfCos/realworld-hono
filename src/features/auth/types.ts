// Command 型定義
export interface RegisterUserCommand {
	username: string;
	email: string;
	password: string;
}

export interface LoginUserCommand {
	email: string;
	password: string;
}

// Query 型定義
export interface GetCurrentUserQuery {
	userId: number; // DBスキーマのserialに合わせる
}

// Response 型定義 (RealWorld API仕様準拠)
export interface UserAuthResponse {
	// 注意: RealWorld仕様ではidフィールドは含まれない
	username: string;
	email: string;
	bio: string; // required (デフォルト値必要)
	image: string; // required (デフォルト値必要)
	token: string;
}

export interface AuthCommandResult {
	success: boolean;
	user?: UserAuthResponse;
	error?: string;
}

export interface GetCurrentUserResult {
	success: boolean;
	user?: Omit<UserAuthResponse, "token">; // token除外、ルート層で追加
	error?: string;
}
