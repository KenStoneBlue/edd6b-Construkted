import argparse
import json
import logging
import os
import urllib.request, urllib.error
import zlib
import wget

parser = argparse.ArgumentParser()
parser.add_argument("asset_number")
parser.add_argument("token")
args = vars(parser.parse_args())

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)


def get_access_token_url(asset_number, token):
    return "https://api.cesium.com/v1/assets/{}/endpoint?access_token={}".format(asset_number, token)


def get_tileset_url(asset_number, access_token):
    return "https://assets.cesium.com/{}/tileset.json?access_token={}".format(asset_number, access_token)


def get_b3dm_file_url(asset_number, access_token, file_uri):
    return "https://assets.cesium.com/{}/{}?access_token={}".format(asset_number, file_uri, access_token)


def get_access_token(asset_number, token):
    try:
        access_token_response = urllib.request.urlopen(get_access_token_url(asset_number, token))
        return json.loads(access_token_response.read().decode('utf8').replace("'", '"'))["accessToken"]
    except urllib.error.HTTPError as error:
        if error.code == 401:
            logger.error("Invalid asset number, token pair")
        else:
            raise


def get_tileset(asset_number, access_token):
    tileset_response = urllib.request.urlopen(get_tileset_url(asset_number, access_token))
    tileset = zlib.decompress(tileset_response.read(), 16+zlib.MAX_WBITS).decode('utf8').replace("'", '"')
    return json.loads(tileset)


def save_tileset(asset_number, tileset):
    os.makedirs(asset_number, exist_ok=True)
    with open(os.path.join(asset_number, 'tileset.json'), 'w') as outfile:
        json.dump(tileset, outfile)


def extract_value(input, key):
    if hasattr(input, 'items'):
        for item_key, item_value in input.items():
            if item_key == key:
                yield item_value
            if isinstance(item_value, dict):
                for result in extract_value(item_value, key):
                    yield result
            elif isinstance(item_value, list):
                for list_item in item_value:
                    for result in extract_value(list_item, key):
                        yield result


def download_b3dm_files(asset_number, access_token, tileset):
    for file in extract_value(tileset, "uri"):
        logger.info("Downloading {}".format(file))

        file_url = get_b3dm_file_url(asset_number, access_token, file)
        file_path = os.path.join(os.getcwd(), asset_number, file)
        #logger.info("File URL Path {}".format(file_url))
		
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
			
        b3dm_file = urllib.request.urlopen(file_url)
        b3dm_file = zlib.decompress(b3dm_file.read(), 16+zlib.MAX_WBITS)
        myfile = open(file_path, 'wb')
        myfile.write(b3dm_file)
        myfile.close()
				
        #wget.download(file_url, file_path) 
		#urllib.request.urlretrieve(file_url, file_path)


def main():
    asset_number = args["asset_number"]
    token = args["token"]

    logger.info("Processing asset {}".format(asset_number))
    access_token = get_access_token(asset_number, token)
    if access_token is None:
        return

    logger.info("Downloading tileset")
    tileset = get_tileset(asset_number, access_token)

    logger.info("Saving tileset")
    save_tileset(asset_number, tileset)

    logger.info("Downloading b3dm files")
    download_b3dm_files(asset_number, access_token, tileset)

    logger.info("All done")


if __name__ == "__main__":
    main()
