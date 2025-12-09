const fs = require('fs');
const path = require('path');
const camelCase = require('camelcase');
const config = require('../config');
const logger = require('../logger');

class Controller {
  static sendResponse(response, payload) {
    /**
    * The default response-code is 200. We want to allow to change that. in That case,
    * payload will be an object consisting of a code and a payload. If not customized
    * send 200 and the payload as received in this method.
    */
    response.status(payload.code || 200);
    const responsePayload = payload.payload !== undefined ? payload.payload : payload;
    if (responsePayload instanceof Object) {
      response.json(responsePayload);
    } else {
      response.end(responsePayload);
    }
  }

  static sendError(response, error) {
    response.status(error.code || 500);
    if (error.error instanceof Object) {
      response.json(error.error);
    } else {
      response.end(error.error || error.message);
    }
  }

  /**
  * Files have been uploaded to the directory defined by config.js as upload directory
  * Files have a temporary name, that was saved as 'filename' of the file object that is
  * referenced in request.files array.
  * This method finds the file and changes it to the file name that was originally called
  * when it was uploaded. To prevent files from being overwritten, a timestamp is added between
  * the filename and its extension
  * @param request
  * @param fieldName
  * @returns {string}
  */
  static collectFile(request, fieldName) {
    let uploadedFileName = '';
    if (request.files && request.files.length > 0) {
      const fileObject = request.files.find((file) => file.fieldname === fieldName);
      if (fileObject) {
        const fileArray = fileObject.originalname.split('.');
        const extension = fileArray.pop();
        fileArray.push(`_${Date.now()}`);
        uploadedFileName = `${fileArray.join('')}.${extension}`;
        fs.renameSync(path.join(config.FILE_UPLOAD_PATH, fileObject.filename),
          path.join(config.FILE_UPLOAD_PATH, uploadedFileName));
      }
    }
    return uploadedFileName;
  }

  static getRequestBodyName(request) {
    const codeGenDefinedBodyName = request.openapi.schema['x-codegen-request-body-name'];
    if (codeGenDefinedBodyName !== undefined) {
      return codeGenDefinedBodyName;
    }
    
    // Vérifier que requestBody existe et a un contenu
    if (!request.openapi.schema.requestBody || 
        !request.openapi.schema.requestBody.content || 
        !request.openapi.schema.requestBody.content['application/json'] ||
        !request.openapi.schema.requestBody.content['application/json'].schema) {
      return 'body';
    }
    
    const refObjectPath = request.openapi.schema.requestBody.content['application/json'].schema.$ref;
    if (refObjectPath !== undefined && refObjectPath.length > 0) {
      return (refObjectPath.substr(refObjectPath.lastIndexOf('/') + 1));
    }
    return 'body';
  }

  static collectRequestParams(request) {
  const requestParams = {};
  
  // ===== DEBUG =====
  console.log('='.repeat(60));
  console.log('🔍 DEBUG collectRequestParams');
  console.log('Path:', request.path);
  console.log('Method:', request.method);
  console.log('Query params:', request.query);
  console.log('Has user:', !!request.user);
  console.log('='.repeat(60));
  // ===== FIN DEBUG =====
  
  // Ajouter les infos d'authentification depuis req.user (prioritaire)
  if (request.user) {
    requestParams.userId = request.user.userId;
    requestParams.role = request.user.role;
    console.log('✅ Added userId from req.user:', requestParams.userId);
  }
  
  // Ou depuis req.openapi (fallback)
  if (!requestParams.userId && request.openapi && request.openapi.userId) {
    requestParams.userId = request.openapi.userId;
    requestParams.role = request.openapi.role;
    console.log('✅ Added userId from req.openapi:', requestParams.userId);
  }

  // Si pas d'openapi.schema, retourner les params déjà collectés
  if (!request.openapi || !request.openapi.schema) {
    console.log('⚠️ No openapi.schema, returning params:', requestParams);
    return requestParams;
  }

  if (request.openapi.schema.requestBody !== null && request.openapi.schema.requestBody !== undefined) {
    const { content } = request.openapi.schema.requestBody;
    if (content['application/json'] !== undefined) {
      const requestBodyName = camelCase(this.getRequestBodyName(request));
      requestParams[requestBodyName] = request.body;
    } else if (content['multipart/form-data'] !== undefined) {
      Object.keys(content['multipart/form-data'].schema.properties).forEach(
        (property) => {
          const propertyObject = content['multipart/form-data'].schema.properties[property];
          if (propertyObject.format !== undefined && propertyObject.format === 'binary') {
            requestParams[property] = this.collectFile(request, property);
          } else {
            requestParams[property] = request.body[property];
          }
        },
      );
    }
  }

  if (request.openapi.schema.parameters !== undefined) {
    request.openapi.schema.parameters.forEach((param) => {
      if (param.in === 'path') {
        requestParams[param.name] = request.openapi.pathParams[param.name];
      } else if (param.in === 'query') {
        // ✅ CORRECTION : N'ajouter que si le paramètre a une valeur
        const value = request.query[param.name];
        if (value !== undefined && value !== null && value !== '') {
          requestParams[param.name] = value;
          console.log(`✅ Added query param '${param.name}':`, value);
        } else {
          console.log(`⚠️ Query param '${param.name}' not provided, skipping`);
        }
      } else if (param.in === 'header') {
        requestParams[param.name] = request.headers[param.name];
      }
    });
  }
  
  console.log('📦 Final collected params:', Object.keys(requestParams));
  return requestParams;
}


  static async handleRequest(request, response, serviceOperation) {
    try {
      const serviceResponse = await serviceOperation(this.collectRequestParams(request));
      Controller.sendResponse(response, serviceResponse);
    } catch (error) {
      Controller.sendError(response, error);
    }
  }
}

module.exports = Controller;
