/// <reference path="../../../tools/typings/jasmine/jasmine.d.ts" />
/// <reference path="../../typings/jasmine-utils.d.ts" />

/// <reference path="../../../dist/arcady-automapper-classes.d.ts" />
/// <reference path="../../../dist/arcady-automapper-interfaces.d.ts" />
/// <reference path="../../../dist/arcady-automapper-declaration.d.ts" />

class PascalCaseToCamelCaseMappingProfile extends AutoMapperJs.Profile {
    public sourceMemberNamingConvention: AutoMapperJs.INamingConvention;
    public destinationMemberNamingConvention: AutoMapperJs.INamingConvention;
    
    public profileName = 'PascalCaseToCamelCase';
    
    public configure() {
        this.sourceMemberNamingConvention = new AutoMapperJs.PascalCaseNamingConvention();
        this.destinationMemberNamingConvention = new AutoMapperJs.CamelCaseNamingConvention();
        
        super.createMap('a', 'b');
    }
}

class CamelCaseToPascalCaseMappingProfile extends AutoMapperJs.Profile {
    public sourceMemberNamingConvention: AutoMapperJs.INamingConvention;
    public destinationMemberNamingConvention: AutoMapperJs.INamingConvention;

    public profileName = 'CamelCaseToPascalCase';
    
    public configure() {
        this.sourceMemberNamingConvention = new AutoMapperJs.CamelCaseNamingConvention();
        this.destinationMemberNamingConvention = new AutoMapperJs.PascalCaseNamingConvention();
    }
}

class ValidatedAgeMappingProfile extends AutoMapperJs.Profile {
    public profileName = 'ValidatedAgeMappingProfile';
    
    public configure() {
        const sourceKey = '{808D9D7F-AA89-4D07-917E-A528F078E642}';
        const destinationKey = '{808D9D6F-BA89-4D17-915E-A528E178EE64}';

        this.createMap(sourceKey, destinationKey)
            .forMember('proclaimedAge', (opts: AutoMapperJs.IMemberConfigurationOptions) =>opts.ignore())
            .forMember('age', (opts: AutoMapperJs.IMemberConfigurationOptions) =>opts.mapFrom('ageOnId'))
            .convertToType(Person);
    }
}

class Person {
    fullName: string;
    age: number;
}

class BeerBuyingYoungster extends Person {
}

describe('AutoMapper.initialize', () => {
    beforeEach(()=>{
        utils.registerTools(this);
        utils.registerCustomMatchers(this);
    });
	
    it('should use created mapping profile', () => {
        // arrange
        var fromKey = '{5700E351-8D88-A327-A216-3CC94A308EDE}';
        var toKey = '{BB33A261-3CA9-A8FC-85E6-2C269F73728C}';

        automapper.initialize((config: AutoMapperJs.IConfiguration) => { 
            config.createMap(fromKey, toKey);
        });

        // act
        automapper.map(fromKey, toKey, {});

        // assert
    });
    
    it('should be able to use a naming convention to convert Pascal case to camel case', () => {
        automapper.initialize((config: AutoMapperJs.IConfiguration) => {
            config.addProfile(new PascalCaseToCamelCaseMappingProfile());
        });

        const sourceKey = 'PascalCase';
        const destinationKey = 'CamelCase';

        const sourceObject = { FullName: 'John Doe' };

        automapper
            .createMap(sourceKey, destinationKey)
            .withProfile('PascalCaseToCamelCase');

        var result = automapper.map(sourceKey, destinationKey, sourceObject);

        expect(result).toEqualData({ fullName: 'John Doe' });
    });

    it('should be able to use a naming convention to convert camelCase to PascalCase', () => {
        automapper.initialize((config: AutoMapperJs.IConfiguration) => {
            config.addProfile(new CamelCaseToPascalCaseMappingProfile());
        });

        const sourceKey = 'CamelCase2';
        const destinationKey = 'PascalCase2';

        const sourceObject = { fullName: 'John Doe' };

        automapper
            .createMap(sourceKey, destinationKey)
            .withProfile('CamelCaseToPascalCase');

        var result = automapper.map(sourceKey, destinationKey, sourceObject);

        expect(result).toEqualData({ FullName: 'John Doe' });
    });
    
    it('should be able to use forMember besides using a profile', () => {
        automapper.initialize((config: AutoMapperJs.IConfiguration) => {
            config.addProfile(new CamelCaseToPascalCaseMappingProfile());
        });

        const sourceKey = 'CamelCase';
        const destinationKey = 'PascalCase';

        const sourceObject = { fullName: 'John Doe', age: 20 };

        automapper
            .createMap(sourceKey, destinationKey)
            .forMember('theAge', (opts: AutoMapperJs.IMemberConfigurationOptions) =>opts.mapFrom('age'))
            .withProfile('CamelCaseToPascalCase');

        var result = automapper.map(sourceKey, destinationKey, sourceObject);

        expect(result).toEqualData({ FullName: 'John Doe', theAge: sourceObject.age });
    });
    
    it('should merge forMember calls when specifying the same destination property normally and using profile', () => {
        automapper.initialize((config: AutoMapperJs.IConfiguration) => {
            config.addProfile(new ValidatedAgeMappingProfile());
        });

        const sourceKey = '{808D9D7F-AA89-4D07-917E-A528F078E642}';
        const destinationKey = '{808D9D6F-BA89-4D17-915E-A528E178EE64}';

        const sourceObject = { fullName: 'John Doe', proclaimedAge: 21, ageOnId: 15 };

        automapper
            .createMap(sourceKey, destinationKey)
            .forMember('ageOnId', (opts: AutoMapperJs.IMemberConfigurationOptions) =>opts.ignore())
            .forMember('age', (opts: AutoMapperJs.IMemberConfigurationOptions) =>opts.mapFrom('proclaimedAge'))
            .convertToType(BeerBuyingYoungster)
            .withProfile('ValidatedAgeMappingProfile');

        var result = automapper.map(sourceKey, destinationKey, sourceObject);

        expect(result).toEqualData({ fullName: 'John Doe', age: sourceObject.ageOnId });
        expect(result instanceof Person).toBeTruthy();
        expect(result instanceof BeerBuyingYoungster).not.toBeTruthy();
    });

    it('should be able to use currying when calling initialize(cfg => cfg.createMap)', () => {
        // arrange
        var fromKey = '{808D9D7F-AA89-4D07-917E-A528F078EE64}';
        var toKey1 = '{B364C0A0-9E24-4424-A569-A4C14102147C}';
        var toKey2 = '{1055CA5A-4FC4-44CA-B4D8-B004F43D4440}';

        var source = { prop: 'Value' };

        // act
        var mapFromKeyCurry: (destinationKey: string) => AutoMapperJs.IAutoMapperCreateMapChainingFunctions;
        
        automapper.initialize((config: AutoMapperJs.IConfiguration) => {
            mapFromKeyCurry = config.createMap(fromKey); // TypeScript does not support function overloads 

            mapFromKeyCurry(toKey1)
                .forSourceMember('prop', (opts: AutoMapperJs.IMemberConfigurationOptions) => { opts.ignore(); });
    
            mapFromKeyCurry(toKey2);
        });

        var result1 = automapper.map(fromKey, toKey1, source);
        var result2 = automapper.map(fromKey, toKey2, source);

        // assert
        expect(typeof mapFromKeyCurry === 'function').toBeTruthy();
        expect(result1.prop).toBeUndefined();
        expect(result2.prop).toEqual(source.prop);
    });

});