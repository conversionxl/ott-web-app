## Documentation to integrate OAuth 2.0 with your application

#### 1. Register your application with the OAuth provider to get your client ID and client secret.
#### 2. Add WordPress plugin to your application from here [OAuth 2.0 Server](https://wordpress.org/plugins/miniorange-oauth-20-server/) 
#### 3. Configure the plugin with your client ID and client secret.
#### 4. Expose the below-mentioned 4 API endpoints 
    - /oauth/authorize (GET) - This endpoint will be used to get the authorization code after login (should be built-in with the plugin)
    - /oauth/token (POST) - This endpoint will be used to get the access token using the authorization code (should be built-in with the plugin)
    - /oauth/me (GET) - This endpoint will be used to get the user details using the access token (should be built-in with the plugin)
    - /oauth/content-token?resourceId=${resourceId} (GET) - This endpoint will be used to get the video content token using the access token and resourceId (Refer to the below code snippet)
#### 5. Use the below code snippet to get the video content token <small>[Probable file location => /wp-content/plugins/miniorange-oauth-20-server/public/class-miniorange-oauth-20-server-public.php]</small>
```php
         /**
	 * Summary of mo_oauth_server_content_token
	 * Handles the resource request and response.
	 * @return string A JSON encoded string
	 */
	public function mo_oauth_server_content_token() {
		$request  = Request::createFromGlobals();
		$response = new Response();
		$server   = $this->mo_oauth_server_init();

		# check availability of content as resourceId
        $resourceId = $request->query('resourceId');
        if (is_null( $resourceId ) || empty( $resourceId )) {
			wp_send_json(
				array(
					'error' => 'invalid_resource_id',
					'desc'  => 'resource id missing',
				),
				403
			);
        }
    
        # Get a api credentials from the jwp dashboard 
        $secretKey = defined('APP_API_V1_CREDENTIAL') ? APP_API_V1_CREDENTIAL : '';
        if (is_null( $secretKey ) || empty( $secretKey )) {
            wp_send_json(
				array(
					'error' => 'invalid_credential',
					'desc'  => 'credential missing',
				),
				403
			);
        }
		
		# verify user login
		if ( ! $server->verifyResourceRequest( $request, $response ) ) {
			$response = $server->getResponse();
			$response->send();
			exit();
		}
		$token     = $server->getAccessTokenData( $request, $response );
		$user_info = $this->mo_oauth_server_get_token_user_info( $token );
		if ( is_null( $user_info ) || empty( $user_info ) ) {
			wp_send_json(
				array(
					'error' => 'invalid_token',
					'desc'  => 'access_token provided is either invalid or does not belong to a valid user.',
				),
				403
			);
		}
        
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $resource = "/v2/media/" . $resourceId;
    
		# token encryption with 2hours and 6 minutes boundary
        $currentTime = time();
        $roundedTime = ceil($currentTime / 360) * 360;
        $expTime = $roundedTime + (2 * 60 * 60);
        $payload = json_encode([
            'iat' => $currentTime,
            'exp' => $expTime,
            'resource' => $resource,
        ]);
    
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secretKey, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
        $jwt = $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    
        return $jwt;
	}
```

#### 6. Add a config value for the JWP dashboard api credentials in the wp-config.php file
```php
define('APP_API_V1_CREDENTIAL', 'YOUR-SECRET-KEY');
```

#### 7. Register `mo_oauth_server_content_token` as a route in the plugin
```php
public function mo_oauth_server_get_default_routes() {
		$default_routes = array(
			....your existing routes ....
			'content-token' => array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'mo_oauth_server_content_token' ),
				'permission_callback' => '__return_true',
			),
		);
		return $default_routes;
	}
```

#### 8. Publish the plugin and test the endpoints using Postman or any other API testing tool.

#### 9. Setup env variables in the OTT-WEB repo
```bash
APP_FOOTER_TEXT=YOUR-APP_FOOTER-TEXT [OPTIONAL, empty if no content to show]
APP_OAUTH_CLIENT_ID=YOUR-CLIENT-ID [REQUIRED]
APP_OAUTH_CLIENT_SECRET=YOUR-CLIENT-SECRET [REQUIRED]
APP_OAUTH_STORAGE= `session` if want to restrict only tab, `local` if want to restrict only browser [REQUIRED]
APP_OAUTH_REDIRECT_URL=your hosted jwp link [REQUIRED]
APP_OAUTH_AUTO_LOGIN= `true` if want to auto login during the first time user visits or else `false` [OPTIONAL]
APP_OAUTH_AUTH_URL=wordpress-site-url/oauth/authorize [REQUIRED]
APP_OAUTH_TOKEN_URL=wordpress-site-url/oauth/token [REQUIRED]
APP_OAUTH_RESOURCE_URL=wordpress-site-url/oauth/me [REQUIRED]
APP_OAUTH_CONTENT_TOKEN_URL=wordpress-site-url/oauth/content-token [REQUIRED]

APP_OAUTH_SIGN_UP_URL=a valid url where to redirect for the sign up cta [REQUIRED]
APP_OAUTH_DASHBOARD_URL=a valid url where to redirect for the back to account cta [REQUIRED]
APP_OAUTH_UNLOCK_ONLY_PREMIUM=`false` if you want to unlock content for non-premium users or else `true` [OPTIONAL]
```

#### 10. Add the following Custom Parameters in the JWP dashboard for specific Apps
```bash
appContentSearch = yes (if you need search bar)
isOAuthMode = yes
urlSigning = yes
```

#### 11. Install the dependencies from the root using the below commands
```bash
yarn install
```
#### 12. Build the project from the root using the below command
```bash
yarn web build
```
#### 13. Host the build folder from  the `platforms/web/build` in the server
