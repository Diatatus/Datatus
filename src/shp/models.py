from django.db import models
import datetime
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
import geopandas as gpd
import os
import glob
import zipfile
import pyproj
from sqlalchemy import *
from geoalchemy2 import Geometry, WKTElement
from geo.Geoserver import Geoserver
from geo.Postgres import Db

# initializing the library
db = Db(dbname='geoapp', user='postgres',password='postgres', host='localhost', port='5432')
geo = Geoserver('http://127.0.0.1:8080/geoserver', username='admin', password='geoserver')


# The shapefile model
class Shp(models.Model):
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=1000, blank=True)
    file = models.FileField(upload_to='%Y/%m/%d')
    uploaded_date = models.DateField(default=datetime.date.today, blank=True)

    def __str__(self):
        return self.name


@receiver(post_save, sender=Shp)
def publish_data(sender, instance, created, **kwargs):
    file = instance.file.path
    file_format = os.path.basename(file).split('.')[-1]
    file_name = os.path.basename(file).split('.')[0]
    file_path = os.path.dirname(file)
    name = instance.name
    conn_str = "postgresql://postgres:postgres@localhost:5432/geoapp"


    #Extraction du fichier zip
    with zipfile.ZipFile(file, 'r') as zip_ref:
        zip_ref.extractall(file_path)

    os.remove(file) #Suppresion du fichier zip après extraction

    shp = glob.glob(r'{}/**/*.shp'.format(file_path), 
                recursive=True)  #Pour obtenir un shp

    try:
        req_shp = shp[0]
        gdf = gpd.read_file(req_shp)  # make geodataframe
        
    
        crs_name = pyproj.CRS("+proj=laea +lat_0=45 +lon_0=-100 +x_0=0 +y_0=0 +a=6370997 +b=6370997 +units=m +no_defs")
    
        epsg = crs_name.to_proj4()

    

        if epsg is None:
          epsg = 32642  # wgs 84 coordinate system

    

        #geom_type = gdf.geom_type[1]

        engine = create_engine(conn_str) #Créér un moteur SQLALchemy 
    
        gdf['geom'] = gdf['geometry'].apply(lambda x: WKTElement(x.wkt, srid = 32642))

            # Drop the geometry column (since we already backup this column with geom)
        gdf.drop('geometry', 1, inplace=True)

        gdf.to_sql(name, engine, 'data', if_exists='replace',index=False, dtype={'geom': Geometry('Geometry', srid=32642
                                                                                                       )})  # post gdf to the postgresql
        
        

        
        for s in shp:
            os.remove(s)
        
        
    except Exception as e:
        for s in shp:
           os.remove(s)
        
        instance.delete()
        print("There is problem during shp upload: ", e)
        
        
    '''
    Publish shp to geoserver using geoserver-rest
    '''
    
    
    geo.create_featurestore(store_name='geoApp', workspace='geoapp', db='geoapp',
                            host='localhost', pg_user='postgres', pg_password='postgres', schema='data')
    geo.publish_featurestore(
        workspace='geoapp', store_name='geoApp', pg_table=name)
    
    geo.create_outline_featurestyle('geoApp_shp', workspace='geoapp')
    geo.publish_style(layer_name=name,style_name='geoApp_shp', workspace='geoapp' )





@receiver(post_delete, sender=Shp)
def delete_data(sender, instance, **kwargs):
    db.delete_table(table_name=instance.name, schema='data', dbname='geoapp')
    geo.delete_layer(instance.name, 'geoapp')